import express from 'express';
import Delivery from '../models/Delivery.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', 
  authenticateToken, 
  authorizeRoles('admin'), 
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalDrivers = await User.countDocuments({ role: 'driver' });
      const activeDrivers = await User.countDocuments({ 
        role: 'driver', 
        'driverInfo.isAvailable': true 
      });
      const totalDeliveries = await Delivery.countDocuments();
      const pendingDeliveries = await Delivery.countDocuments({ status: 'pending' });
      const overdueDeliveries = await Delivery.countDocuments({
        status: 'pending',
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      // Recent deliveries
      const recentDeliveries = await Delivery.find()
        .populate('customer', 'name email')
        .populate('driver', 'name email')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        stats: {
          totalUsers,
          totalDrivers,
          activeDrivers,
          totalDeliveries,
          pendingDeliveries,
          overdueDeliveries
        },
        recentDeliveries: recentDeliveries.map(d => d.toJSON())
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all deliveries with filters
router.get('/deliveries', 
  authenticateToken, 
  authorizeRoles('admin'), 
  async (req, res) => {
    try {
      const { status, priority, page = 1, limit = 20, search } = req.query;
      const query = {};

      if (status) query.status = status;
      if (priority) query.priority = priority;

      let deliveries = Delivery.find(query)
        .populate('customer', 'name email phone')
        .populate('driver', 'name email phone driverInfo.vehicleType');

      if (search) {
        deliveries = deliveries.or([
          { 'pickupLocation.address': { $regex: search, $options: 'i' } },
          { 'dropLocation.address': { $regex: search, $options: 'i' } }
        ]);
      }

      const results = await deliveries
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Delivery.countDocuments(query);

      res.json({
        deliveries: results.map(d => d.toJSON()),
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } catch (error) {
      console.error('Get admin deliveries error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Assign delivery to driver
router.post('/assign-delivery', 
  authenticateToken, 
  authorizeRoles('admin'), 
  async (req, res) => {
    try {
      const { deliveryId, driverId } = req.body;

      const delivery = await Delivery.findById(deliveryId)
        .populate('customer', 'name email');
      const driver = await User.findById(driverId);

      if (!delivery || !driver) {
        return res.status(404).json({ message: 'Delivery or driver not found' });
      }

      if (delivery.status !== 'pending') {
        return res.status(400).json({ message: 'Delivery cannot be assigned' });
      }

      if (driver.role !== 'driver') {
        return res.status(400).json({ message: 'User is not a driver' });
      }

      // Assign delivery
      delivery.driver = driverId;
      delivery.status = 'assigned';
      delivery.autoAssignedAt = new Date();
      await delivery.save();

      // Update driver availability
      await User.findByIdAndUpdate(driverId, {
        'driverInfo.isAvailable': false
      });

      // Send emails
      await sendEmail({
        to: delivery.customer.email,
        subject: 'Driver Assigned - LuggEase',
        html: `
          <h2>Driver Assigned to Your Delivery</h2>
          <p>Hi ${delivery.customer.name},</p>
          <p>We've assigned a driver to your delivery request.</p>
          <p><strong>Driver:</strong> ${driver.name}</p>
          <p><strong>Vehicle:</strong> ${driver.driverInfo.vehicleType}</p>
          <p>Track your delivery in real-time on our platform.</p>
        `
      });

      await sendEmail({
        to: driver.email,
        subject: 'New Delivery Assignment - LuggEase',
        html: `
          <h2>New Delivery Assignment</h2>
          <p>Hi ${driver.name},</p>
          <p>You have been assigned a new delivery by admin.</p>
          <p><strong>Pickup:</strong> ${delivery.pickupLocation.address}</p>
          <p><strong>Drop:</strong> ${delivery.dropLocation.address}</p>
          <p>Please check your driver dashboard for more details.</p>
        `
      });

      // Real-time notifications
      req.io.to(`user_${delivery.customer._id}`).emit('delivery_assigned', {
        deliveryId: delivery._id,
        driver: {
          id: driver._id,
          name: driver.name,
          vehicleInfo: driver.driverInfo
        }
      });

      req.io.to(`user_${driverId}`).emit('new_assignment', {
        deliveryId: delivery._id,
        message: 'You have been assigned a new delivery'
      });

      res.json({
        message: 'Delivery assigned successfully',
        delivery: delivery.toJSON()
      });
    } catch (error) {
      console.error('Assign delivery error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all users
router.get('/users', 
  authenticateToken, 
  authorizeRoles('admin'), 
  async (req, res) => {
    try {
      const { role, page = 1, limit = 20, search } = req.query;
      const query = {};

      if (role) query.role = role;

      let users = User.find(query).select('-password');

      if (search) {
        users = users.or([
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]);
      }

      const results = await users
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

      res.json({
        users: results.map(u => u.toJSON()),
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;