import React, { useState, useEffect } from 'react';
import { Package, Truck, Users, Clock, TrendingUp, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';

interface DashboardStats {
  totalUsers?: number;
  totalDrivers?: number;
  activeDrivers?: number;
  totalDeliveries?: number;
  pendingDeliveries?: number;
  overdueDeliveries?: number;
}

interface RecentDelivery {
  id: string;
  pickupLocation: { address: string };
  dropLocation: { address: string };
  status: string;
  createdAt: string;
  customer?: { name: string };
  driver?: { name: string };
}

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'admin') {
        const response = await axios.get('/admin/dashboard');
        setStats(response.data.stats);
        setRecentDeliveries(response.data.recentDeliveries);
      } else {
        // For customers and drivers, fetch their deliveries
        const response = await axios.get('/delivery/my-deliveries?limit=5');
        setRecentDeliveries(response.data.deliveries);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.name}!`;
  };

  const getStatsCards = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: 'Total Users',
          value: stats.totalUsers || 0,
          icon: Users,
          color: 'blue',
          change: '+12%'
        },
        {
          title: 'Active Drivers',
          value: `${stats.activeDrivers || 0}/${stats.totalDrivers || 0}`,
          icon: Truck,
          color: 'green',
          change: '+5%'
        },
        {
          title: 'Total Deliveries',
          value: stats.totalDeliveries || 0,
          icon: Package,
          color: 'purple',
          change: '+18%'
        },
        {
          title: 'Pending Deliveries',
          value: stats.pendingDeliveries || 0,
          icon: Clock,
          color: 'orange',
          change: stats.overdueDeliveries ? `${stats.overdueDeliveries} overdue` : 'On track'
        }
      ];
    }

    if (user?.role === 'driver') {
      return [
        {
          title: 'Completed Today',
          value: 0,
          icon: Package,
          color: 'green',
          change: 'Great job!'
        },
        {
          title: 'Active Deliveries',
          value: recentDeliveries.filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status)).length,
          icon: Truck,
          color: 'blue',
          change: 'In progress'
        },
        {
          title: 'Total Earnings',
          value: '$0',
          icon: TrendingUp,
          color: 'purple',
          change: 'This week'
        },
        {
          title: 'Rating',
          value: user.driverInfo?.rating || 5.0,
          icon: Users,
          color: 'orange',
          change: '⭐ Excellent'
        }
      ];
    }

    // Customer stats
    return [
      {
        title: 'Total Deliveries',
        value: recentDeliveries.length,
        icon: Package,
        color: 'blue',
        change: 'All time'
      },
      {
        title: 'Active Deliveries',
        value: recentDeliveries.filter(d => !['delivered', 'cancelled'].includes(d.status)).length,
        icon: Truck,
        color: 'green',
        change: 'In progress'
      },
      {
        title: 'Completed',
        value: recentDeliveries.filter(d => d.status === 'delivered').length,
        icon: TrendingUp,
        color: 'purple',
        change: 'Successfully'
      },
      {
        title: 'Saved Time',
        value: '24h',
        icon: Clock,
        color: 'orange',
        change: 'This month'
      }
    ];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      picked_up: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      in_transit: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  const statsCards = getStatsCards();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {getWelcomeMessage()}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user?.role === 'admin' 
            ? 'Monitor and manage your delivery platform'
            : user?.role === 'driver'
            ? 'Ready to make some deliveries today?'
            : 'Track your deliveries and book new ones'
          }
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Deliveries
          </h2>
        </div>
        
        <div className="p-6">
          {recentDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {user?.role === 'customer' 
                  ? 'No deliveries yet. Create your first delivery!'
                  : 'No recent deliveries to show.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDeliveries.slice(0, 5).map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {delivery.pickupLocation.address} → {delivery.dropLocation.address}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.role === 'admin' && delivery.customer && `Customer: ${delivery.customer.name}`}
                        {user?.role === 'customer' && delivery.driver && `Driver: ${delivery.driver.name}`}
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                    {delivery.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;