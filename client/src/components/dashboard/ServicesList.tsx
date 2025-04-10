import React from 'react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

interface Service {
  id: number;
  name: string;
  price: string;
}

interface ServicesListProps {
  isLoading: boolean;
  services: Service[];
}

const ServicesList: React.FC<ServicesListProps> = ({ isLoading, services }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow">
      <div className="px-5 pt-5 pb-3 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Popular Services</h2>
      </div>
      <div className="p-5">
        <ul className="space-y-3">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <li key={index} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 bg-gray-700" />
                  <Skeleton className="h-3 w-16 bg-gray-700 mt-1" />
                </div>
                <Skeleton className="h-6 w-20 rounded bg-gray-700" />
              </li>
            ))
          ) : services.length > 0 ? (
            services.slice(0, 5).map((service) => (
              <li key={service.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{service.name}</p>
                  <p className="text-xs text-gray-400">${service.price}</p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                  {Math.floor(Math.random() * 40) + 10} bookings
                </div>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-400 py-3">No services found</li>
          )}
        </ul>
        
        <Link href="/services">
          <div className="mt-4 text-sm text-center w-full text-blue-500 hover:text-blue-400 font-medium block cursor-pointer">
            Manage Services
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ServicesList;
