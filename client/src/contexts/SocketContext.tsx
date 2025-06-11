import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'delivery' | 'system' | 'payment' | 'rating';
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from server');
      });

      // Listen for delivery updates
      socketInstance.on('delivery_status_update', (data) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'Delivery Update',
          message: `Your delivery status has been updated to ${data.status.replace('_', ' ')}`,
          type: 'delivery',
          timestamp: new Date(),
          isRead: false,
          data
        };
        addNotification(notification);
        toast.success(notification.message);
      });

      socketInstance.on('delivery_assigned', (data) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'Driver Assigned',
          message: `${data.driver.name} has been assigned to your delivery`,
          type: 'delivery',
          timestamp: new Date(),
          isRead: false,
          data
        };
        addNotification(notification);
        toast.success(notification.message);
      });

      socketInstance.on('new_assignment', (data) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'New Assignment',
          message: data.message,
          type: 'delivery',
          timestamp: new Date(),
          isRead: false,
          data
        };
        addNotification(notification);
        toast.info(notification.message);
      });

      socketInstance.on('delivery_completed', (data) => {
        const notification: Notification = {
          id: Date.now().toString(),
          title: 'Delivery Completed',
          message: 'Your delivery has been completed successfully!',
          type: 'delivery',
          timestamp: new Date(),
          isRead: false,
          data
        };
        addNotification(notification);
        toast.success(notification.message);
      });

      socketInstance.on('driver_location', (data) => {
        // Handle real-time driver location updates
        console.log('Driver location update:', data);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [token, user]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    addNotification,
    markAsRead,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};