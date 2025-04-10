import React from 'react';
import { CalendarIcon, UsersIcon, ScissorsIcon, DollarSignIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardOverviewProps {
  isLoading: boolean;
  data?: {
    todayBookingsCount: number;
    activeClientsCount: number;
    monthlyRevenue: number;
    completedServicesCount: number;
  };
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ isLoading, data }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Today's Bookings */}
      <div className="bg-gray-800 rounded-lg shadow p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-400">Today's Bookings</p>
            {isLoading ? (
              <Skeleton className="h-7 w-10 bg-gray-700" />
            ) : (
              <p className="text-2xl font-semibold text-white">{data?.todayBookingsCount || 0}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-400 flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            12% from yesterday
          </span>
        </div>
      </div>
      
      {/* Active Clients */}
      <div className="bg-gray-800 rounded-lg shadow p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-400">Active Clients</p>
            {isLoading ? (
              <Skeleton className="h-7 w-10 bg-gray-700" />
            ) : (
              <p className="text-2xl font-semibold text-white">{data?.activeClientsCount || 0}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-400 flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            8% from last week
          </span>
        </div>
      </div>
      
      {/* Monthly Revenue */}
      <div className="bg-gray-800 rounded-lg shadow p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
            <DollarSignIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
            {isLoading ? (
              <Skeleton className="h-7 w-20 bg-gray-700" />
            ) : (
              <p className="text-2xl font-semibold text-white">{data?.monthlyRevenue || 0} AED</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-400 flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            18% from last month
          </span>
        </div>
      </div>
      
      {/* Completed Services */}
      <div className="bg-gray-800 rounded-lg shadow p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
            <ScissorsIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-400">Completed Services</p>
            {isLoading ? (
              <Skeleton className="h-7 w-10 bg-gray-700" />
            ) : (
              <p className="text-2xl font-semibold text-white">{data?.completedServicesCount || 0}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <span className="text-sm text-green-400 flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            10% from last week
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
