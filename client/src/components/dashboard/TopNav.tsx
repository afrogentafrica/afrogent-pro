import React from 'react';
import { MenuIcon, SearchIcon, BellIcon } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

interface TopNavProps {
  setSidebarOpen: (open: boolean) => void;
}

const TopNav: React.FC<TopNavProps> = ({ setSidebarOpen }) => {
  const user = getCurrentUser();
  
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-400"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          
          {/* Logo (mobile only) */}
          <div className="md:hidden flex items-center">
            <div className="bg-blue-500 p-1 rounded-md">
              <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4"></path>
                <path d="M12 2v4"></path>
                <path d="M16 2v4"></path>
                <path d="M2 9h20"></path>
                <path d="M21 13v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8"></path>
              </svg>
            </div>
            <span className="ml-2 text-lg font-bold text-white">AfroGents</span>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="md:block hidden">
              <button className="text-gray-400 hover:text-white">
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <button className="text-gray-400 hover:text-white relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform -translate-y-1/2 translate-x-1/2"></span>
              </button>
            </div>
            
            {/* Profile */}
            <div className="relative">
              <button className="flex items-center">
                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-600">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0D8ABC&color=fff`}
                    alt="Admin profile" 
                    className="h-full w-full object-cover" 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
