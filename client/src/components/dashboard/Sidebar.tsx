import React from 'react';
import { Link, useLocation } from 'wouter';
import { HomeIcon, UsersIcon, ScissorsIcon, Users, CalendarIcon, CogIcon, LogOutIcon, SmartphoneIcon } from 'lucide-react';
import { logout } from '@/lib/auth';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  // Helper component to replace the Link with <a> nesting issue
  const NavLink = ({ href, isActive, children }: { 
    href: string; 
    isActive: boolean; 
    children: React.ReactNode 
  }) => {
    return (
      <Link href={href}>
        <div className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
          isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}>
          {children}
        </div>
      </Link>
    );
  };

  return (
    <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:flex flex-col w-64 bg-gray-800 border-r border-gray-700`}>
      {/* Logo */}
      <div className="p-4 flex items-center border-b border-gray-700">
        <div className="bg-blue-500 p-2 rounded-md">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <span className="ml-2 text-xl font-bold text-white">AfroGents</span>
      </div>
      
      {/* Navigation */}
      <nav className="px-2 py-4 flex-grow">
        <h2 className="text-xs text-gray-500 uppercase tracking-wide font-semibold px-2 mb-2">Menu</h2>
        <ul className="space-y-1">
          <li>
            <NavLink href="/dashboard" isActive={isActive('/dashboard')}>
              <HomeIcon className="mr-3 h-5 w-5 text-gray-400" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink href="/clients" isActive={isActive('/clients')}>
              <UsersIcon className="mr-3 h-5 w-5 text-gray-400" />
              Clients
            </NavLink>
          </li>
          <li>
            <NavLink href="/bookings" isActive={isActive('/bookings')}>
              <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
              Bookings
            </NavLink>
          </li>
          <li>
            <NavLink href="/services" isActive={isActive('/services')}>
              <ScissorsIcon className="mr-3 h-5 w-5 text-gray-400" />
              Services
            </NavLink>
          </li>
          <li>
            <NavLink href="/stylists" isActive={isActive('/stylists')}>
              <Users className="mr-3 h-5 w-5 text-gray-400" />
              Stylists
            </NavLink>
          </li>
        </ul>
        
        <h2 className="mt-6 text-xs text-gray-500 uppercase tracking-wide font-semibold px-2 mb-2">Configuration</h2>
        <ul className="space-y-1">
          <li>
            <NavLink href="/mobile-app" isActive={isActive('/mobile-app')}>
              <SmartphoneIcon className="mr-3 h-5 w-5 text-gray-400" />
              Mobile Preview
            </NavLink>
          </li>
          <li>
            <NavLink href="/settings" isActive={isActive('/settings')}>
              <CogIcon className="mr-3 h-5 w-5 text-gray-400" />
              Settings
            </NavLink>
          </li>
          <li>
            <div 
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
            >
              <LogOutIcon className="mr-3 h-5 w-5 text-gray-400" />
              Logout
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
