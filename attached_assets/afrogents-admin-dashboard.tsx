import React, { useState } from 'react';
import { BellIcon, CalendarIcon, ChartBarIcon, CogIcon, HomeIcon, InboxIcon, MenuIcon, ScissorsIcon, UserGroupIcon, UsersIcon, XIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const bookings = [
    { id: 1, client: 'Michael Johnson', service: 'Haircut & Beard Trim', date: '2025-04-08', time: '10:00 AM', status: 'confirmed' },
    { id: 2, client: 'David Williams', service: 'Hair Styling', date: '2025-04-08', time: '1:30 PM', status: 'pending' },
    { id: 3, client: 'Robert Brown', service: 'Skincare Treatment', date: '2025-04-09', time: '11:15 AM', status: 'confirmed' },
    { id: 4, client: 'James Davis', service: 'Event Grooming Package', date: '2025-04-10', time: '4:00 PM', status: 'pending' },
    { id: 5, client: 'Thomas Miller', service: 'Haircut', date: '2025-04-12', time: '2:45 PM', status: 'confirmed' },
  ];
  
  const stylists = [
    { id: 1, name: 'Claude Njeam', title: 'Master Barber', bookings: 28, rating: 4.8 },
    { id: 2, name: 'James Peterson', title: 'Afro Specialist', bookings: 24, rating: 4.7 },
  ];
  
  const services = [
    { id: 1, name: 'Haircut & Trim', price: '200 AED', bookings: 42 },
    { id: 2, name: 'Shaving Service', price: '150 AED', bookings: 36 },
    { id: 3, name: 'Hair Styling', price: '250 AED', bookings: 29 },
    { id: 4, name: 'Beard & Mustache Service', price: '180 AED', bookings: 31 },
    { id: 5, name: 'Grooming Package', price: '350 AED', bookings: 18 },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800'; 
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Bookings</p>
                <p className="text-lg font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Clients</p>
                <p className="text-lg font-semibold text-gray-900">47</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-lg font-semibold text-gray-900">14,800 AED</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <ScissorsIcon className="h