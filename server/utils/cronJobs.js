import cron from 'node-cron';
import Delivery from '../models/Delivery.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from './emailService.js';

export const startCronJobs = (io) => {
  // Auto-assign deliveries after 24 hours
  cron.schedule('0 */1 * * *', async () => { // Run every hour
    try {
      console.log('Running auto-assignment check...');
      
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const overdueDeliveries = await Delivery.find({
        status: 'pending',
        driver: null,
        createdAt: { $lt: cutoffTime }
      }).populate('customer', 'name email');

      for (const delivery of overdueDeliveries) {
        // Find nearest available driver
        const availableDrivers = await User.find({
          role: 'driver',
          'driverInfo.isAvailable': true,
          isActive: true
        });

        if (availableDrivers.length > 0) {
          // For simplicity, assign to first available driver
          // In production, you'd calculate nearest driver based on location
          const selectedDriver = availableDrivers[0];

          // Assign delivery
          delivery.driver = selectedDriver._id;
          delivery.status = 'assigned';
          delivery.autoAssignedAt = new Date();
          await delivery.save();

          // Update driver availability
          selectedDriver.driverInfo.isAvailable = false;
          await selectedDriver.save();

          // Send notifications
          await sendEmail({
            to: delivery.customer.email,
            subject: 'Driver Auto-Assigned - LuggEase',
            html: `
              <h2>Driver Assigned to Your Delivery</h2>
              <p>Hi ${delivery.customer.name},</p>
              <p>We've automatically assigned a driver to your delivery request.</p>
              <p><strong>Driver:</strong> ${selectedDriver.name}</p>
              <p><strong>Vehicle:</strong> ${selectedDriver.driverInfo.vehicleType}</p>
              <p>Sorry for the delay. Track your delivery in real-time on our platform.</p>
            `
          });

          await sendEmail({
            to: selectedDriver.email,
            subject: 'New Delivery Assignment - LuggEase',
            html: `
              <h2>New Delivery Assignment</h2>
              <p>Hi ${selectedDriver.name},</p>
              <p>You have been auto-assigned a delivery.</p>
              <p><strong>Pickup:</strong> ${delivery.pickupLocation.address}</p>
              <p><strong>Drop:</strong> ${delivery.dropLocation.address}</p>
              <p>Please check your driver dashboard for details.</p>
            `
          });

          // Real-time notifications
          io.to(`user_${delivery.customer._id}`).emit('delivery_assigned', {
            deliveryId: delivery._id,
            driver: {
              id: selectedDriver._id,
              name: selectedDriver.name,
              vehicleInfo: selectedDriver.driverInfo
            },
            autoAssigned: true
          });

          io.to(`user_${selectedDriver._id}`).emit('new_assignment', {
            deliveryId: delivery._id,
            message: 'You have been auto-assigned a delivery'
          });

          console.log(`Auto-assigned delivery ${delivery._id} to driver ${selectedDriver.name}`);
        } else {
          // Mark as urgent if no drivers available
          delivery.isUrgent = true;
          delivery.priority = 'urgent';
          await delivery.save();

          // Notify admins
          const admins = await User.find({ role: 'admin' });
          for (const admin of admins) {
            await new Notification({
              recipient: admin._id,
              title: 'Urgent: No Drivers Available',
              message: `Delivery ${delivery._id} has been pending for 24+ hours with no available drivers`,
              type: 'system',
              priority: 'high',
              data: { deliveryId: delivery._id, actionRequired: true }
            }).save();

            await sendEmail({
              to: admin.email,
              subject: 'URGENT: Delivery Assignment Needed',
              html: `
                <h2>Urgent Delivery Assignment Required</h2>
                <p>Delivery ${delivery._id} has been pending for over 24 hours.</p>
                <p><strong>Customer:</strong> ${delivery.customer.name}</p>
                <p><strong>Pickup:</strong> ${delivery.pickupLocation.address}</p>
                <p><strong>Drop:</strong> ${delivery.dropLocation.address}</p>
                <p>Please manually assign a driver or contact the customer.</p>
              `
            });
          }

          console.log(`No drivers available for delivery ${delivery._id}, marked as urgent`);
        }
      }

      console.log(`Processed ${overdueDeliveries.length} overdue deliveries`);
    } catch (error) {
      console.error('Auto-assignment cron job error:', error);
    }
  });

  // Clean up old notifications (older than 30 days)
  cron.schedule('0 2 * * *', async () => { // Run daily at 2 AM
    try {
      const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });
      console.log(`Cleaned up ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Notification cleanup error:', error);
    }
  });

  console.log('Cron jobs started successfully');
};