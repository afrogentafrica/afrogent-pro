import React from 'react';
import { Link } from 'wouter';
import { UserPlusIcon, CalendarPlusIcon, ScissorsIcon, BarChartIcon } from 'lucide-react';

const QuickActions: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg shadow">
      <div className="px-5 pt-5 pb-3 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Quick Actions</h2>
      </div>
      <div className="p-5 grid grid-cols-2 gap-3">
        <Link href="/clients/new">
          <div className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition cursor-pointer">
            <UserPlusIcon className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-xs text-white">Add Client</span>
          </div>
        </Link>
        
        <Link href="/bookings/new">
          <div className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition cursor-pointer">
            <CalendarPlusIcon className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-xs text-white">New Booking</span>
          </div>
        </Link>
        
        <Link href="/services/new">
          <div className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition cursor-pointer">
            <ScissorsIcon className="h-6 w-6 text-purple-500 mb-2" />
            <span className="text-xs text-white">Add Service</span>
          </div>
        </Link>
        
        <Link href="/reports">
          <div className="flex flex-col items-center justify-center bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition cursor-pointer">
            <BarChartIcon className="h-6 w-6 text-yellow-500 mb-2" />
            <span className="text-xs text-white">Reports</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
