import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Truck, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  MapPin,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: Home, label: 'Dashboard', exact: true }
    ];

    if (user?.role === 'customer') {
      return [
        ...commonItems,
        { path: '/dashboard/new-delivery', icon: Plus, label: 'New Delivery' },
        { path: '/dashboard/deliveries', icon: Package, label: 'My Deliveries' },
        { path: '/dashboard/tracking', icon: MapPin, label: 'Track Delivery' }
      ];
    }

    if (user?.role === 'driver') {
      return [
        ...commonItems,
        { path: '/dashboard/available', icon: Package, label: 'Available Jobs' },
        { path: '/dashboard/my-deliveries', icon: Truck, label: 'My Deliveries' },
        { path: '/dashboard/earnings', icon: BarChart3, label: 'Earnings' }
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...commonItems,
        { path: '/dashboard/deliveries', icon: Package, label: 'All Deliveries' },
        { path: '/dashboard/users', icon: Users, label: 'Manage Users' },
        { path: '/dashboard/drivers', icon: Truck, label: 'Manage Drivers' },
        { path: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' }
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 w-64 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;