import React, { useState, useEffect } from 'react';
import { MapPin, Package, Clock, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TrackDelivery: React.FC = () => {
  const [selectedDelivery, setSelectedDelivery] = useState<string>('');
  const [trackingData, setTrackingData] = useState<any>(null);

  // Mock tracking data
  const mockDelivery = {
    id: 'DEL123456',
    status: 'in_transit',
    driver: {
      name: 'John Smith',
      phone: '+1 234 567 8900',
      vehicle: 'Honda Civic - ABC 123',
      rating: 4.8
    },
    pickup: {
      address: '123 Main St, New York, NY',
      time: '2024-01-15T10:30:00Z',
      completed: true
    },
    drop: {
      address: '456 Oak Ave, Brooklyn, NY',
      estimatedTime: '2024-01-15T14:30:00Z'
    },
    currentLocation: {
      lat: 40.7589,
      lng: -73.9851,
      address: 'Times Square, New York, NY'
    },
    timeline: [
      {
        status: 'Order Placed',
        time: '2024-01-15T09:00:00Z',
        completed: true,
        description: 'Your delivery request has been created'
      },
      {
        status: 'Driver Assigned',
        time: '2024-01-15T09:15:00Z',
        completed: true,
        description: 'John Smith has been assigned as your driver'
      },
      {
        status: 'Picked Up',
        time: '2024-01-15T10:30:00Z',
        completed: true,
        description: 'Items have been picked up from the origin'
      },
      {
        status: 'In Transit',
        time: '2024-01-15T11:00:00Z',
        completed: true,
        description: 'Your items are on the way to destination'
      },
      {
        status: 'Out for Delivery',
        time: '2024-01-15T13:30:00Z',
        completed: false,
        description: 'Driver is approaching the destination'
      },
      {
        status: 'Delivered',
        time: '2024-01-15T14:30:00Z',
        completed: false,
        description: 'Items delivered successfully'
      }
    ]
  };

  useEffect(() => {
    // Simulate loading tracking data
    if (selectedDelivery) {
      setTimeout(() => {
        setTrackingData(mockDelivery);
      }, 1000);
    }
  }, [selectedDelivery]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Track Delivery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your delivery ID to track your package in real-time
        </p>
      </motion.div>

      {/* Tracking Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter delivery ID (e.g., DEL123456)"
            value={selectedDelivery}
            onChange={(e) => setSelectedDelivery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => setSelectedDelivery('DEL123456')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            Track
          </button>
        </div>
      </motion.div>

      {trackingData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Live Location
            </h2>
            
            {/* Mock Map */}
            <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
              <img
                src="https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg"
                alt="Map view"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Current Location
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trackingData.currentLocation.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {trackingData.driver.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {trackingData.driver.vehicle}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {trackingData.driver.rating}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Delivery Timeline
            </h2>

            <div className="space-y-4">
              {trackingData.timeline.map((event: any, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    event.completed 
                      ? 'bg-green-500' 
                      : index === trackingData.timeline.findIndex((e: any) => !e.completed)
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}></div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${
                        event.completed 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {event.status}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.completed 
                          ? new Date(event.time).toLocaleTimeString()
                          : 'Pending'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Estimated Delivery */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Estimated Delivery
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {new Date(trackingData.drop.estimatedTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {selectedDelivery && !trackingData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
        >
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading tracking information...
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TrackDelivery;