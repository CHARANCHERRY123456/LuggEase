import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, Users, DollarSign, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalRevenue: 15420.50,
      totalDeliveries: 1247,
      activeUsers: 892,
      avgDeliveryTime: 2.4
    },
    trends: {
      revenue: [
        { date: '2024-01-01', value: 1200 },
        { date: '2024-01-02', value: 1450 },
        { date: '2024-01-03', value: 1100 },
        { date: '2024-01-04', value: 1800 },
        { date: '2024-01-05', value: 2100 },
        { date: '2024-01-06', value: 1900 },
        { date: '2024-01-07', value: 2200 }
      ],
      deliveries: [
        { date: '2024-01-01', value: 45 },
        { date: '2024-01-02', value: 52 },
        { date: '2024-01-03', value: 38 },
        { date: '2024-01-04', value: 67 },
        { date: '2024-01-05', value: 78 },
        { date: '2024-01-06', value: 71 },
        { date: '2024-01-07', value: 82 }
      ]
    },
    topDrivers: [
      { name: 'John Smith', deliveries: 45, rating: 4.9, earnings: 1250 },
      { name: 'Sarah Johnson', deliveries: 42, rating: 4.8, earnings: 1180 },
      { name: 'Mike Wilson', deliveries: 38, rating: 4.7, earnings: 1050 },
      { name: 'Emily Davis', deliveries: 35, rating: 4.9, earnings: 980 },
      { name: 'David Brown', deliveries: 32, rating: 4.6, earnings: 890 }
    ],
    deliveryStatus: {
      pending: 23,
      assigned: 45,
      in_transit: 67,
      delivered: 892,
      cancelled: 12
    }
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor platform performance and key metrics
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            title: 'Total Revenue',
            value: `$${analyticsData.overview.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'green',
            change: '+12.5%'
          },
          {
            title: 'Total Deliveries',
            value: analyticsData.overview.totalDeliveries.toLocaleString(),
            icon: Package,
            color: 'blue',
            change: '+8.2%'
          },
          {
            title: 'Active Users',
            value: analyticsData.overview.activeUsers.toLocaleString(),
            icon: Users,
            color: 'purple',
            change: '+15.3%'
          },
          {
            title: 'Avg Delivery Time',
            value: `${analyticsData.overview.avgDeliveryTime}h`,
            icon: Clock,
            color: 'orange',
            change: '-5.1%'
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${
                  stat.change.startsWith('+') 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change} from last period
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Revenue Trend
          </h2>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.trends.revenue.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(item.value / Math.max(...analyticsData.trends.revenue.map(r => r.value))) * 200}px` 
                  }}
                ></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(item.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Delivery Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Delivery Status Distribution
          </h2>
          
          <div className="space-y-4">
            {Object.entries(analyticsData.deliveryStatus).map(([status, count]) => {
              const total = Object.values(analyticsData.deliveryStatus).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'pending' ? 'bg-yellow-400' :
                      status === 'assigned' ? 'bg-blue-400' :
                      status === 'in_transit' ? 'bg-purple-400' :
                      status === 'delivered' ? 'bg-green-400' :
                      'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Top Drivers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Top Performing Drivers
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Driver
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Deliveries
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rating
                </th>
                <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topDrivers.map((driver, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                          {driver.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {driver.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-600 dark:text-gray-400">
                    {driver.deliveries}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-gray-900 dark:text-white">
                        {driver.rating}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    ${driver.earnings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;