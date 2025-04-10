import React from 'react';
import { Link } from 'wouter';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Stylist {
  id: number;
  name: string;
  title: string;
  rating: string;
}

interface StylistsListProps {
  isLoading: boolean;
  stylists: Stylist[];
}

const StylistsList: React.FC<StylistsListProps> = ({ isLoading, stylists }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow">
      <div className="px-5 pt-5 pb-3 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Top Stylists</h2>
      </div>
      <div className="p-5 space-y-5">
        {isLoading ? (
          Array(2).fill(0).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24 bg-gray-700" />
                  <Skeleton className="h-3 w-16 bg-gray-700 mt-1" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-12 bg-gray-700 inline-block" />
                <Skeleton className="h-3 w-20 bg-gray-700 mt-1" />
              </div>
            </div>
          ))
        ) : stylists.length > 0 ? (
          <>
            {stylists.map((stylist) => (
              <div key={stylist.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${stylist.name.replace(/\s+/g, '+')}&background=4E2A84&color=fff`} 
                      alt={stylist.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{stylist.name}</p>
                    <p className="text-xs text-gray-400">{stylist.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                    <span className="text-sm ml-1 text-white">{stylist.rating}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">24 bookings</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-center text-gray-400 py-3">No stylists found</div>
        )}
        
        <Link href="/stylists">
          <div className="mt-3 text-sm text-center w-full text-blue-500 hover:text-blue-400 font-medium block cursor-pointer">
            View All Stylists
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StylistsList;
