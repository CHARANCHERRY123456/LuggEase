import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import LassyAssistant from '../components/AI/LassyAssistant';

// Dashboard pages
import DashboardHome from './dashboard/DashboardHome';
import NewDelivery from './dashboard/NewDelivery';
import MyDeliveries from './dashboard/MyDeliveries';
import TrackDelivery from './dashboard/TrackDelivery';
import AvailableDeliveries from './dashboard/AvailableDeliveries';
import AdminDeliveries from './dashboard/AdminDeliveries';
import AdminUsers from './dashboard/AdminUsers';
import AdminAnalytics from './dashboard/AdminAnalytics';
import Settings from './dashboard/Settings';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/new-delivery" element={<NewDelivery />} />
            <Route path="/deliveries" element={<MyDeliveries />} />
            <Route path="/tracking" element={<TrackDelivery />} />
            <Route path="/available" element={<AvailableDeliveries />} />
            <Route path="/my-deliveries" element={<MyDeliveries />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* AI Assistant */}
      <LassyAssistant />
    </div>
  );
};

export default Dashboard;