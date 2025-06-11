import React, { useState } from 'react';
import { MapPin, Package, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface DeliveryForm {
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
    contactName: string;
    contactPhone: string;
    instructions: string;
  };
  dropLocation: {
    address: string;
    latitude: number;
    longitude: number;
    contactName: string;
    contactPhone: string;
    instructions: string;
  };
  items: Array<{
    description: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: number;
    fragile: boolean;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledPickup: string;
}

const NewDelivery: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0);
  
  const [formData, setFormData] = useState<DeliveryForm>({
    pickupLocation: {
      address: '',
      latitude: 0,
      longitude: 0,
      contactName: '',
      contactPhone: '',
      instructions: ''
    },
    dropLocation: {
      address: '',
      latitude: 0,
      longitude: 0,
      contactName: '',
      contactPhone: '',
      instructions: ''
    },
    items: [{
      description: '',
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      value: 0,
      fragile: false
    }],
    priority: 'medium',
    scheduledPickup: new Date().toISOString().slice(0, 16)
  });

  const steps = [
    { number: 1, title: 'Pickup Details', icon: MapPin },
    { number: 2, title: 'Drop Details', icon: MapPin },
    { number: 3, title: 'Item Details', icon: Package },
    { number: 4, title: 'Review & Confirm', icon: Clock }
  ];

  const handleLocationSearch = async (address: string, type: 'pickup' | 'drop') => {
    // In a real app, you'd use Mapbox Geocoding API here
    // For now, we'll simulate coordinates
    const mockCoordinates = {
      latitude: 40.7128 + Math.random() * 0.1,
      longitude: -74.0060 + Math.random() * 0.1
    };

    setFormData(prev => ({
      ...prev,
      [`${type}Location`]: {
        ...prev[`${type}Location` as keyof typeof prev],
        address,
        ...mockCoordinates
      }
    }));

    // Calculate estimated fee when both locations are set
    if (formData.pickupLocation.address && formData.dropLocation.address) {
      calculateEstimatedFee();
    }
  };

  const calculateEstimatedFee = () => {
    // Simple fee calculation based on distance and priority
    const baseDistance = Math.random() * 20 + 5; // 5-25 km
    let baseFee = 5 + (baseDistance * 0.5);
    
    const priorityMultipliers = {
      low: 1,
      medium: 1,
      high: 1.5,
      urgent: 2
    };
    
    const totalFee = baseFee * priorityMultipliers[formData.priority];
    setEstimatedFee(Math.round(totalFee * 100) / 100);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        value: 0,
        fragile: false
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/delivery', formData);
      toast.success('Delivery request created successfully!');
      navigate('/dashboard/deliveries');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create delivery');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pickup Location Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pickup Address *
              </label>
              <input
                type="text"
                value={formData.pickupLocation.address}
                onChange={(e) => handleLocationSearch(e.target.value, 'pickup')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter pickup address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.pickupLocation.contactName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pickupLocation: { ...prev.pickupLocation, contactName: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contact person name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.pickupLocation.contactPhone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pickupLocation: { ...prev.pickupLocation, contactPhone: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.pickupLocation.instructions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  pickupLocation: { ...prev.pickupLocation, instructions: e.target.value }
                }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Any special instructions for pickup..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Drop Location Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Drop Address *
              </label>
              <input
                type="text"
                value={formData.dropLocation.address}
                onChange={(e) => handleLocationSearch(e.target.value, 'drop')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter drop address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.dropLocation.contactName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dropLocation: { ...prev.dropLocation, contactName: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Contact person name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.dropLocation.contactPhone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dropLocation: { ...prev.dropLocation, contactPhone: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Instructions
              </label>
              <textarea
                value={formData.dropLocation.instructions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dropLocation: { ...prev.dropLocation, instructions: e.target.value }
                }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Any special instructions for delivery..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Item Details
              </h3>
              <button
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Item {index + 1}
                  </h4>
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Describe the item"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="0.0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Value ($)
                    </label>
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => updateItem(index, 'value', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.fragile}
                        onChange={(e) => updateItem(index, 'fragile', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fragile item - handle with care
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, priority: e.target.value as any }));
                    calculateEstimatedFee();
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority (+50%)</option>
                  <option value="urgent">Urgent (+100%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scheduled Pickup
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledPickup}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledPickup: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Review & Confirm
            </h3>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Estimated Delivery Fee
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    Based on distance and priority
                  </p>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${estimatedFee}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Pickup Location
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {formData.pickupLocation.address}
                </p>
                {formData.pickupLocation.contactName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Contact: {formData.pickupLocation.contactName}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Drop Location
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {formData.dropLocation.address}
                </p>
                {formData.dropLocation.contactName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Contact: {formData.dropLocation.contactName}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Items ({formData.items.length})
              </h4>
              {formData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.description} ({item.weight}kg)
                  </span>
                  {item.fragile && (
                    <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-2 py-1 rounded">
                      Fragile
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Create New Delivery
        </h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center ${
                  step.number < steps.length ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500'
                  }`}>
                    Step {step.number}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.title}
                  </p>
                </div>
                {step.number < steps.length && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Delivery'
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewDelivery;