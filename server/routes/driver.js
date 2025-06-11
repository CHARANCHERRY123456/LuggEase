import express from 'express';
import { body, validationResult } from 'express-validator';
import Delivery from '../models/Delivery.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// Get available deliveries for drivers
router.get('/available-deliveries', 
  authenticateToken, 
  authorizeRoles('driver'), 
  async (req, res) => {
    try {
      const deliveries = await Delivery.find({ 
        status: 'pending',
        driver: null 
      })
      .populate('customer', 'name phone')
      .sort({ priority: -1, createdAt: 1 })
      .limit(20);

      res.json({ 
        deliveries: deliveries.map(d => d.toJSON()) 
      });
    } catch (error) {
      console.error('Get available deliveries error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Accept delivery
router.post('/accept/:deliveryId', 
  authenticateToken, 
  authorizeRoles('driver'), 
  async (req, res) => {
    try {
      const delivery = await Delivery.findById(req.params.deliveryId)
        .populate('customer', 'name email');

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }

      if (delivery.status !== 'pending' || delivery.driver) {
        return res.status(400).json({ message: 'Delivery no longer available' });
      }

      // Check if driver is available
      if (!req.user.driverInfo.isAvailable) {
        return res.status(400).json({ message: 'Driver not available' });
      }

      // Assign delivery to driver
      delivery.driver = req.user._id;
      delivery.status = 'assigned';
      await delivery.save();

      // Update driver availability
      await User.findByIdAndUpdate(req.user._id, {
        'driverInfo.isAvailable': false
      });

      // Send email to customer
      await sendEmail({
        to: delivery.customer.email,
        subject: 'Driver Assigned - LuggEase',
        html: `
          <h2>Driver Assigned to Your Delivery</h2>
          <p>Hi ${delivery.customer.name},</p>
          <p>Good news! A driver has accepted your delivery request.</p>
          <p><strong>Driver:</strong> ${req.user.name}</p>
          <p><strong>Vehicle:</strong> ${req.user.driverInfo.vehicleType} (${req.user.driverInfo.vehicleNumber})</p>
          <p><strong>Phone:</strong> ${req.user.phone || 'Contact through app'}</p>
          <p>You can track your delivery in real-time on our platform.</p>
        `
      });

      // Real-time notification
      req.io.to(`user_${delivery.customer._id}`).emit('delivery_assigned', {
        deliveryId: delivery._id,
        driver: {
          id: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          vehicleInfo: req.user.driverInfo
        }
      });

      res.json({
        message: 'Delivery accepted successfully',
        delivery: delivery.toJSON()
      });
    } catch (error) {
      console.error('Accept delivery error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update driver location
router.post('/location', 
  authenticateToken, 
  authorizeRoles('driver'), 
  [
    body('latitude').isNumeric().withMessage('Latitude is required'),
    body('longitude').isNumeric().withMessage('Longitude is required'),
    body('address').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { latitude, longitude, address } = req.body;

      await User.findByIdAndUpdate(req.user._id, {
        'driverInfo.currentLocation': {
          latitude,
          longitude,
          address: address || '',
          lastUpdated: new Date()
        }
      });

      res.json({ message: 'Location updated successfully' });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Complete delivery
router.post('/complete/:deliveryId', 
  authenticateToken, 
  authorizeRoles('driver'), 
  async (req, res) => {
    try {
      const delivery = await Delivery.findById(req.params.deliveryId)
        .populate('customer', 'name email');

      if (!delivery) {
        return res.status(404).json({ message: 'Delivery not found' });
      }

      if (delivery.driver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (delivery.status !== 'in_transit') {
        return res.status(400).json({ message: 'Delivery not in transit' });
      }

      // Update delivery status
      delivery.status = 'delivered';
      delivery.actualDeliveryTime = new Date();
      await delivery.save();

      // Update driver stats and make available
      await User.findByIdAndUpdate(req.user._id, {
        'driverInfo.isAvailable': true,
        $inc: { 'driverInfo.totalDeliveries': 1 }
      });

      // Send completion email
      await sendEmail({
        to: delivery.customer.email,
        subject: 'Delivery Completed - LuggEase',  
        html: `
          <h2>Delivery Completed Successfully</h2>
          <p>Hi ${delivery.customer.name},</p>
          <p>Your delivery has been completed successfully!</p>
          <p><strong>Delivery ID:</strong> ${delivery._id}</p>
          <p><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
          <p>Please rate your experience to help us improve our service.</p>
        `
      });

      // Real-time notification
      req.io.to(`user_${delivery.customer._id}`).emit('delivery_completed', {
        deliveryId: delivery._id,
        completedAt: delivery.actualDeliveryTime
      });

      res.json({
        message: 'Delivery completed successfully',
        delivery: delivery.toJSON()
      });
    } catch (error) {
      console.error('Complete delivery error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;