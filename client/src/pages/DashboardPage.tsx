import React from 'react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { requireAdmin } from '@/lib/auth';

const DashboardPage: React.FC = () => {
  return <AdminDashboard />;
};

export default requireAdmin(DashboardPage);
