import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import DashboardHome from './DashboardHome';
import Packages from './modules/Packages';
import Destinations from './modules/Destinations';
import Bookings from './modules/Bookings';
/*
import Messages from './modules/Messages';
import Coupons from './modules/Coupons';
*/
import Hotels from './modules/Hotels';
import Transportation from './modules/Transportation';
import Users from './modules/Users';
import Reviews from './modules/Reviews';
/*
import Payments from './modules/Payments';
*/
import Settings from './modules/Settings';
import AuditLogs from './AuditLogs';

const AdminDashboard = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="packages" element={<Packages />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="bookings" element={<Bookings />} />
        {/*
        <Route path="messages" element={<Messages />} />
        <Route path="coupons" element={<Coupons />} />
        */}
        <Route path="hotels" element={<Hotels />} />
        <Route path="transportation" element={<Transportation />} />
        <Route path="users" element={<Users />} />
        <Route path="reviews" element={<Reviews />} />
        {/*
        <Route path="payments" element={<Payments />} />
        */}
        <Route path="settings" element={<Settings />} />
        <Route path="audit-logs" element={<AuditLogs />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
