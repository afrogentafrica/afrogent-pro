import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import DashboardOverview from './DashboardOverview';
import BookingsList from './BookingsList';
import StylistsList from './StylistsList';
import ServicesList from './ServicesList';
import QuickActions from './QuickActions';
import { useQuery } from '@tanstack/react-query';

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch dashboard overview data
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['/api/dashboard/overview'],
    retry: 1,
  });

  // Fetch recent bookings
  const { data: bookingsData, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['/api/bookings'],
    retry: 1,
  });

  // Fetch stylists
  const { data: stylistsData, isLoading: isLoadingStylists } = useQuery({
    queryKey: ['/api/stylists'],
    retry: 1,
  });

  // Fetch services
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    retry: 1,
  });

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar (desktop) */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Mobile sidebar overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-gray-800 bg-opacity-90 transition-opacity ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <TopNav setSidebarOpen={setSidebarOpen} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          <div>
            {/* Page header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back, Admin</p>
            </div>
            
            {/* Dashboard Overview */}
            <DashboardOverview isLoading={isLoadingOverview} data={overviewData} />
            
            {/* Main content sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
              {/* Recent bookings (left column) */}
              <div className="lg:col-span-8">
                <BookingsList isLoading={isLoadingBookings} bookings={bookingsData?.bookings || []} />
              </div>
              
              {/* Right sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <StylistsList isLoading={isLoadingStylists} stylists={stylistsData?.stylists || []} />
                <ServicesList isLoading={isLoadingServices} services={servicesData?.services || []} />
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
