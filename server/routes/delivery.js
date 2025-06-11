import express from 'express';
import { body, validationResult } from 'express-validator';
import Delivery from '../models/Delivery.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendEmail } from '../utils/emailService.js';
import { calculateDistance } from '../utils/mapUtils.js';

const router = express.Router();

// Create delivery request
router.post('/', authenticateToken, [
  body('pickupLocation.address').notEmpty().withMessage('Pickup address is required'),
  body('pickupLocation.latitude').isNumeric().withMessage('Pickup latitude is required'),
  body('pickupLocation.longitude').isNumeric().withMessage('Pickup longitude is required'),
  body('dropLocation.address').notEmpty().withMessage('Drop address is required'),
  body('dropLocation.latitude').isNumeric().withMessage('Drop latitude is required'),
  body('dropLocation.longitude').isNumeric().withMessage('Drop longitude is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.weight').isNumeric({ min: 0.1 }).withMessage('Item weight is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deliveryData = req.body;
    deliveryData.customer = req.user._id;

    // Calculate distance
    const distance = calculateDistance(
      deliveryData.pickupLocation.latitude,
      deliveryData.pickupLocation.longitude,
      deliveryData.dropLocation.latitude,
      deliveryData.dropLocation.longitude
    );
    deliveryData.distance = distance;

    // Create delivery
    const delivery = new Delivery(deliveryData);
    await delivery.save();

    // Populate customer info
    await delivery.populate('customer', 'name email phone');

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: 'Delivery Request Created - LuggEase',
      html: `
        <h2>Delivery Request Confirmed</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your delivery request has been created successfully.</p>
        <p><strong>Delivery ID:</strong> ${delivery._id}</p>
        <p><strong>Pickup:</strong> ${delivery.pickupLocation.address}</p>
        <p><strong>Drop:</strong> ${delivery.dropLocation.address}</p>
        <p><strong>Estimated Fee:</strong> $${delivery.deliveryFee}</p>
        <p>We'll notify you once a driver accepts your request.</p>
      `
    });

    // Create notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await new Notification({
        recipient: admin._id,
        title: 'New Delivery Request',
        message: `New delivery request from ${req.user.name}`,
        type: 'delivery',
        data: { deliveryId: delivery._id }
      }).save();
    }

    // Notify all connected clients
    req.io.emit('new_delivery', delivery);

    res.status(201).json({
      message: 'Delivery request created successfully',
      delivery: delivery.toJSON()
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's deliveries
router.get('/my-deliveries', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'driver') {
      query.driver = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const deliveries = await Delivery.find(query)
      .populate('customer', 'name email phone')
      .populate('driver', 'name email phone driverInfo.vehicleType driverInfo.vehicleNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Delivery.countDocuments(query);

    res.json({
      deliveries: deliveries.map(d => d.toJSON()),
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single delivery
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('driver', 'name email phone driverInfo');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Check if user has access to this delivery
    const hasAccess = 
      req.user.role === 'admin' ||
      delivery.customer._id.toString() === req.user._id.toString() ||
      (delivery.driver && delivery.driver._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ delivery: delivery.toJSON() });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update delivery status
router.patch('/:id/status', authenticateToken, [
  body('status').isIn(['assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('driver', 'name email');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Only driver or admin can update status
    if (req.user.role !== 'admin' && 
        (!delivery.driver || delivery.driver._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    delivery.status = status;

    // Set timestamps based on status
    if (status === 'picked_up') {
      delivery.actualPickupTime = new Date();
    } else if (status === 'delivered') {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    // Send email notification to customer
    const statusMessages = {
      assigned: 'A driver has been assigned to your delivery',
      picked_up: 'Your items have been picked up',
      in_transit: 'Your delivery is in transit',
      delivered: 'Your delivery has been completed',
      cancelled: 'Your delivery has been cancelled'
    };

    await sendEmail({
      to: delivery.customer.email,
      subject: `Delivery Update - ${status.replace('_', ' ').toUpperCase()}`,
      html: `
        <h2>Delivery Status Update</h2>
        <p>Hi ${delivery.customer.name},</p>
        <p>${statusMessages[status]}</p>
        <p><strong>Delivery ID:</strong> ${delivery._id}</p>
        <p>Track your delivery in real-time on our platform.</p>
      `
    });

    // Real-time notification
    req.io.to(`user_${delivery.customer._id}`).emit('delivery_status_update', {
      deliveryId: delivery._id,
      status: status,
      timestamp: new Date()
    });

    res.json({
      message: 'Status updated successfully',
      delivery: delivery.toJSON()
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;