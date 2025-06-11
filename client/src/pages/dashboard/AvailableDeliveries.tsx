import React, { useState, useEffect } from 'react';
import { Package, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AvailableDelivery {
  id: string;
  pickupLocation: { address: string };
  dropLocation: { address: string };
  priority: string;
  deliveryFee: number;
  distance: number;
  createdAt: string;
  scheduledPickup: string;
  customer: { name: string; phone?: string };
  items: Array<{ description: string; weight: number; fragile: boolean }>;
}

const AvailableDeliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<AvailableDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableDeliveries();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAvailableDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailableDeliveries = async () => {
    try {
      const response = await axios.get('/driver/available-deliveries');
      setDeliveries(response.data.deliveries);
    } catch (error) {
      console.error('Failed to fetch available deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    setAcceptingId(deliveryId);
    try {
      await axios.post(`/driver/accept/${deliveryId}`);
      toast.success('Delivery accepted successfully!');
      
      // Remove the accepted delivery from the list
      setDeliveries(prev => prev.filter(d => d.id !== deliveryId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setAcceptingId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const calculateEarnings = (fee: number) => {
    // Driver gets 80% of the delivery fee
    return Math.round(fee * 0.8 * 100) / 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Available Deliveries
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Accept delivery requests and start earning
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Potential Earnings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${deliveries.reduce((sum, d) => sum + calculateEarnings(d.deliveryFee), 0).toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Urgent Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.filter(d => d.priority === 'urgent').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </motion.div>

      {/* Deliveries List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        {deliveries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Available Deliveries
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new delivery opportunities.
            </p>
          </div>
        ) : (
          deliveries.map((delivery, index) => (
            <motion.div
              key={delivery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delivery #{delivery.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Posted {formatDistanceToNow(new Date(delivery.createdAt))} ago
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                      {delivery.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Pickup
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {delivery.pickupLocation.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Drop
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {delivery.dropLocation.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        Pickup: {new Date(delivery.scheduledPickup).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{delivery.distance} km</span>
                    </div>
                    <div>
                      Customer: {delivery.customer.name}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Items ({delivery.items.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {delivery.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {item.description} ({item.weight}kg)
                          {item.fragile && (
                            <span className="ml-1 text-orange-600">⚠️</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Fee
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${delivery.deliveryFee}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      You earn: ${calculateEarnings(delivery.deliveryFee)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleAcceptDelivery(delivery.id)}
                    disabled={acceptingId === delivery.id}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                  >
                    {acceptingId === delivery.id ? (
                      <>
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default AvailableDeliveries;