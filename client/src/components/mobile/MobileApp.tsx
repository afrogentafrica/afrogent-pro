import React, { useState, useEffect } from 'react';
import { Star, MapPin, ChevronRight, Home, Search, Calendar, ShoppingBag, User, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Stylist {
  id: number;
  name: string;
  title: string;
  bio: string | null;
  image: string | null;
  email: string | null;
  phoneNumber: string | null;
  rating: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  category: 'Hair' | 'Beard' | 'Skincare' | 'Nails' | 'Event' | 'Other';
  image: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface StylistWithServices extends Stylist {
  services?: Array<{
    id: number;
    name: string;
    price: string;
  }>;
}

interface DateOption {
  day: string;
  month: string;
  weekday: string;
}

// Default image URLs for stylists and user avatar
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlciUyMGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&w=100&q=80";
const DEFAULT_STYLIST_IMAGE = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmFyYmVyfGVufDB8fDB8fHww&w=300&q=80";

const AfroGentsMobileApp: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('browse');
  const [selectedDate, setSelectedDate] = useState('13');
  const [selectedBarber, setSelectedBarber] = useState<StylistWithServices | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<{id: number, name: string, price: string} | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("05:00 PM");
  const [clientName, setClientName] = useState<string>("Guest User");
  const [clientPhone, setClientPhone] = useState<string>("+971 50 123 4567");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);
  
  // Fetch stylists from backend
  const { data: stylistsData, isLoading: stylistsLoading } = useQuery({
    queryKey: ['/api/stylists'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/stylists');
      const data = await response.json();
      return data;
    }
  });
  
  // Filter stylists based on selected category
  const getFilteredStylists = () => {
    if (!stylistsData?.stylists) return [];
    if (selectedCategory === 'All') return stylistsData.stylists;
    
    // In a more complete implementation, we would filter based on stylist's services
    // For demo purposes, we'll filter randomly but consistently
    return stylistsData.stylists.filter((stylist: Stylist) => {
      if (selectedCategory === 'Hair' && stylist.id % 3 === 0) return true;
      if (selectedCategory === 'Beard' && stylist.id % 3 === 1) return true;
      if (selectedCategory === 'Color' && stylist.id % 3 === 2) return true;
      return false;
    });
  };

  // Fetch services from backend
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/services');
      const data = await response.json();
      return data;
    }
  });

  // Generate dates for the next few days
  const generateDates = (): DateOption[] => {
    const dates: DateOption[] = [];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    const today = new Date();
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      dates.push({
        day: date.getDate().toString(),
        month: months[date.getMonth()],
        weekday: weekdays[date.getDay()]
      });
    }
    
    return dates;
  };
  
  const dates = generateDates();

  // Get services for a specific stylist
  const getStylistServices = (stylistId: number): Array<{id: number, name: string, price: string}> => {
    if (!servicesData?.services) return [];
    
    // In a real app, we would fetch the specific services for this stylist
    // For now, we'll just return all services as a demo
    return servicesData.services.map((service: Service) => ({
      id: service.id,
      name: service.name,
      price: service.price
    }));
  };

  const handleBarberSelect = (barber: StylistWithServices) => {
    // Add services to the barber object
    const barberWithServices = {
      ...barber,
      services: getStylistServices(barber.id)
    };
    
    setSelectedBarber(barberWithServices);
    setActiveScreen('detail');
  };

  const handleBookNow = () => {
    setActiveScreen('booking');
  };

  const handleBackToDetail = () => {
    setActiveScreen('detail');
  };

  const handleBackToBrowse = () => {
    setActiveScreen('browse');
    setSelectedBarber(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedBarber) return;
    if (!selectedService) {
      alert("Please select a service before booking");
      return;
    }
    
    setIsBookingSubmitting(true);
    
    try {
      // Format date from the selected date
      const selectedDateObj = new Date();
      selectedDateObj.setDate(parseInt(selectedDate));
      
      // Calculate an estimated end time (1 hour after start)
      const calculateEndTime = (startTime: string) => {
        const isPM = startTime.includes('PM');
        const hour = parseInt(startTime.split(':')[0]);
        let endHour = hour + 1;
        
        // Handle hour rollover
        if (endHour > 12) {
          endHour = endHour - 12;
        }
        
        return `${endHour.toString().padStart(2, '0')}:00 ${isPM ? 'PM' : 'AM'}`;
      };
      
      const bookingData = {
        clientName: clientName,
        clientContact: clientPhone,
        clientLocation: "Dubai, UAE",
        stylistId: selectedBarber.id,
        serviceId: selectedService.id,
        date: selectedDateObj.toISOString().split('T')[0],
        timeStart: selectedTime,
        timeEnd: calculateEndTime(selectedTime),
        status: "pending",
        paymentMethod: "cash",
        paymentStatus: "pending",
        notes: "Booked via mobile app"
      };
      
      // Make API call to create booking
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      
      if (!response.ok) {
        throw new Error("Failed to create booking");
      }
      
      const result = await response.json();
      
      // Show success message
      alert(`Booking confirmed! Your appointment with ${selectedBarber.name} for ${selectedService.name} is scheduled on ${selectedDate} at ${selectedTime}.`);
      
      // Navigate back to browse
      handleBackToBrowse();
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const renderBrowseScreen = () => {
    return (
      <div className="relative h-full bg-black text-white p-4">
        {/* Profile section with user info */}
        <div className="mb-6 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={DEFAULT_AVATAR} alt="User" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-base font-medium">Allen Roy</h2>
            <div className="flex items-center text-gray-400 text-xs">
              <MapPin size={12} className="mr-1" />
              <span>Old Cutler Rd</span>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`${selectedCategory === 'All' ? 'bg-green-400 text-black' : 'border border-gray-600 text-white'} px-6 py-2 rounded-full text-sm font-medium min-w-[60px] flex justify-center`}
          >
            All
          </button>
          <button 
            onClick={() => setSelectedCategory('Hair')}
            className={`${selectedCategory === 'Hair' ? 'bg-green-400 text-black' : 'border border-gray-600 text-white'} px-6 py-2 rounded-full text-sm min-w-[60px] flex justify-center`}
          >
            Hair
          </button>
          <button 
            onClick={() => setSelectedCategory('Beard')}
            className={`${selectedCategory === 'Beard' ? 'bg-green-400 text-black' : 'border border-gray-600 text-white'} px-6 py-2 rounded-full text-sm min-w-[60px] flex justify-center`}
          >
            Beard
          </button>
          <button 
            onClick={() => setSelectedCategory('Color')}
            className={`${selectedCategory === 'Color' ? 'bg-green-400 text-black' : 'border border-gray-600 text-white'} px-6 py-2 rounded-full text-sm min-w-[60px] flex justify-center`}
          >
            Color
          </button>
        </div>

        {/* Stylist cards */}
        <div className="space-y-4 pb-20">
          {stylistsLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
            </div>
          ) : stylistsData?.stylists && getFilteredStylists().length > 0 ? (
            getFilteredStylists().map((barber: Stylist) => (
              <div 
                key={barber.id} 
                className="bg-gray-900 rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => handleBarberSelect(barber)}
              >
                <div className="relative h-48">
                  <img 
                    src={barber.image || DEFAULT_STYLIST_IMAGE} 
                    alt={barber.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-lg font-bold">{barber.name}</h3>
                    <p className="text-sm text-gray-300">{barber.title || "Precision Cuts"}</p>
                    <div className="flex items-center text-gray-300 text-xs mt-1">
                      <MapPin size={12} className="mr-1" />
                      <span>Old Cutler Rd, Cutler Bay</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 rounded-full p-2">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback example stylists when data is empty
            <div>
              <div 
                className="bg-gray-900 rounded-3xl overflow-hidden cursor-pointer mb-4"
                onClick={() => {
                  const demoBarber = {
                    id: 1,
                    name: "Allen Markel",
                    title: "Precision Cuts",
                    bio: "Barbers benefit from skilled hand-eye coordination when making precise cuts and adding color to hair.",
                    image: DEFAULT_STYLIST_IMAGE,
                    email: "allen@afrogents.com",
                    phoneNumber: null,
                    rating: "4.3",
                    isActive: true,
                    createdAt: new Date()
                  };
                  handleBarberSelect(demoBarber);
                }}
              >
                <div className="relative h-48">
                  <img 
                    src={DEFAULT_STYLIST_IMAGE} 
                    alt="Allen Markel" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-lg font-bold">Allen Markel</h3>
                    <p className="text-sm text-gray-300">Precision Cuts</p>
                    <div className="flex items-center text-gray-300 text-xs mt-1">
                      <MapPin size={12} className="mr-1" />
                      <span>Old Cutler Rd, Cutler Bay</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 rounded-full p-2">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
              
              <div 
                className="bg-gray-900 rounded-3xl overflow-hidden cursor-pointer"
                onClick={() => {
                  const demoBarber = {
                    id: 2,
                    name: "Nohita Kneet",
                    title: "Hair Stylist",
                    bio: "Specializes in modern hair styles and treatments with years of experience.",
                    image: DEFAULT_STYLIST_IMAGE,
                    email: "nohita@afrogents.com",
                    phoneNumber: null,
                    rating: "4.7",
                    isActive: true,
                    createdAt: new Date()
                  };
                  handleBarberSelect(demoBarber);
                }}
              >
                <div className="relative h-48">
                  <img 
                    src={DEFAULT_STYLIST_IMAGE} 
                    alt="Nohita Kneet" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-lg font-bold">Nohita Kneet</h3>
                    <p className="text-sm text-gray-300">Hair Stylist</p>
                    <div className="flex items-center text-gray-300 text-xs mt-1">
                      <MapPin size={12} className="mr-1" />
                      <span>Old Cutler Rd, Cutler Bay</span>
                    </div>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 rounded-full p-2">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black py-4 px-8 flex justify-between">
          <button className="flex flex-col items-center text-green-400 relative">
            <div className="bg-green-400 p-3 rounded-full">
              <Home size={20} className="text-black" />
            </div>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-500">
            <div className="p-3 rounded-full bg-gray-800">
              <MapPin size={20} />
            </div>
            <span className="text-xs mt-1">Nearby</span>
          </button>
          <button className="flex flex-col items-center text-gray-500">
            <div className="p-3 rounded-full bg-gray-800">
              <ShoppingBag size={20} />
            </div>
            <span className="text-xs mt-1">Orders</span>
          </button>
          <button className="flex flex-col items-center text-gray-500">
            <div className="p-3 rounded-full bg-gray-800">
              <User size={20} />
            </div>
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    );
  };

  const renderDetailScreen = () => {
    if (!selectedBarber) return null;
    
    return (
      <div className="h-full bg-black text-white">
        <div className="relative h-72">
          <img 
            src={selectedBarber.image || DEFAULT_STYLIST_IMAGE} 
            alt={selectedBarber.name} 
            className="w-full h-full object-cover" 
          />
          <button 
            className="absolute top-4 left-4 bg-gray-800 rounded-full p-2"
            onClick={handleBackToBrowse}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">{selectedBarber.name}</h2>
            <div className="flex items-center">
              <Star size={16} className="text-green-400 mr-1" fill="currentColor" />
              <span className="font-semibold">{selectedBarber.rating || '4.3'}</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm mb-6">
            <MapPin size={14} className="mr-1" />
            <span>Old Cutler Rd, Cutler Bay</span>
          </div>
          
          {/* Services */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {servicesLoading ? (
              <div className="col-span-2 flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
              </div>
            ) : selectedBarber.services && selectedBarber.services.length > 0 ? (
              selectedBarber.services.map((service) => (
                <div 
                  key={service.id} 
                  className={`p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
                    selectedService && selectedService.id === service.id 
                      ? 'bg-green-400 text-black' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedService(service)}
                >
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="font-bold text-lg">${service.price}</p>
                </div>
              ))
            ) : (
              <>
                <div 
                  className={`p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
                    selectedService && selectedService.id === 1 
                      ? 'bg-green-400 text-black' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedService({id: 1, name: "Haircut", price: "200.00"})}
                >
                  <p className="text-sm font-medium">Haircut</p>
                  <p className="font-bold text-lg">$200.00</p>
                </div>
                <div 
                  className={`p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
                    selectedService && selectedService.id === 2 
                      ? 'bg-green-400 text-black' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedService({id: 2, name: "Beard Trim", price: "150.00"})}
                >
                  <p className="text-sm font-medium">Beard Trim</p>
                  <p className="font-bold text-lg">$150.00</p>
                </div>
                <div 
                  className={`p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
                    selectedService && selectedService.id === 3 
                      ? 'bg-green-400 text-black' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedService({id: 3, name: "Hair Color", price: "250.00"})}
                >
                  <p className="text-sm font-medium">Hair Color</p>
                  <p className="font-bold text-lg">$250.00</p>
                </div>
                <div 
                  className={`p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
                    selectedService && selectedService.id === 4 
                      ? 'bg-green-400 text-black' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedService({id: 4, name: "Shave", price: "180.00"})}
                >
                  <p className="text-sm font-medium">Shave</p>
                  <p className="font-bold text-lg">$180.00</p>
                </div>
              </>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-400 text-sm leading-relaxed">
              {selectedBarber.bio 
                ? selectedBarber.bio.length > 100 
                  ? selectedBarber.bio.substring(0, 100) + '...' 
                  : selectedBarber.bio
                : "Specializes in precision cuts and styling for all hair types. Known for attention to detail and excellent customer service."}
              <span className="text-green-400 ml-1">Read More</span>
            </p>
          </div>
          
          {/* Book Now Button */}
          <button 
            onClick={() => {
              if (!selectedService) {
                alert('Please select a service first');
                return;
              }
              handleBookNow();
            }}
            className={`w-full py-3 px-4 rounded-full flex items-center justify-between ${
              selectedService ? 'bg-green-400 text-black' : 'bg-gray-700 text-white'
            } transition-colors duration-300`}
          >
            <div className={`${selectedService ? 'bg-black text-white' : 'bg-gray-800'} rounded-full p-2`}>
              <ChevronRight size={20} />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg">Book Now</span>
              {selectedService ? (
                <span className="text-xs">{selectedService.name} - ${selectedService.price}</span>
              ) : (
                <span className="text-xs opacity-70">Select a service first</span>
              )}
            </div>
            <div className="flex">
              <ChevronRight size={16} className={selectedService ? 'text-black' : 'text-gray-500'} />
              <ChevronRight size={16} className={selectedService ? 'text-black' : 'text-gray-500'} />
              <ChevronRight size={16} className={selectedService ? 'text-black' : 'text-gray-500'} />
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderBookingScreen = () => {
    if (!selectedBarber) return null;
    
    return (
      <div className="h-full bg-black text-white">
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={handleBackToDetail}
              className="bg-gray-800 rounded-full p-2"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold">Book Now</h2>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
          
          {/* Barber info */}
          <div className="flex items-center mb-4 bg-gray-900 bg-opacity-50 p-3 rounded-2xl">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img 
                src={selectedBarber.image || DEFAULT_STYLIST_IMAGE} 
                alt={selectedBarber.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-bold">{selectedBarber.name}</h3>
              <div className="flex items-center text-gray-400 text-xs">
                <MapPin size={12} className="mr-1" />
                <span>Old Cutler Rd, Cutler Bay</span>
              </div>
            </div>
          </div>
          
          {/* Selected Service */}
          {selectedService && (
            <div className="mb-4 bg-gray-900 bg-opacity-50 p-3 rounded-2xl">
              <p className="text-gray-400 text-sm mb-1">Selected Service</p>
              <div className="flex justify-between items-center">
                <p className="font-medium">{selectedService.name}</p>
                <p className="font-bold text-green-400">${selectedService.price}</p>
              </div>
            </div>
          )}
          
          {/* Client Information */}
          <div className="mb-4 bg-gray-900 bg-opacity-50 p-3 rounded-2xl">
            <p className="text-gray-400 text-sm mb-2">Your Information</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Your Name</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg p-2 text-white text-sm"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phone Number</label>
                <input 
                  type="text" 
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg p-2 text-white text-sm"
                  placeholder="+971 50 XXX XXXX"
                />
              </div>
            </div>
          </div>
          
          {/* Available slots */}
          <div className="mb-6 bg-gray-900 bg-opacity-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Available Slots</h3>
              <button className="text-gray-400 text-sm font-medium">
                Week
              </button>
            </div>
            
            {/* Date selection */}
            <p className="text-gray-400 text-sm mb-2">Select Date</p>
            <div className="flex justify-between mb-6">
              {dates.map(date => (
                <button 
                  key={date.day}
                  className={`flex flex-col items-center p-3 rounded-xl ${
                    selectedDate === date.day ? 'bg-green-400 text-black' : 'bg-gray-800'
                  }`}
                  onClick={() => setSelectedDate(date.day)}
                >
                  <span className="text-sm">{date.day}</span>
                  <span className="text-xs">{date.month}</span>
                  <span className="text-xs mt-1">{date.weekday}</span>
                </button>
              ))}
            </div>
            
            {/* Time selection */}
            <p className="text-gray-400 text-sm mb-2">Select Time</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"].map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-xl text-center ${
                    selectedTime === time ? 'bg-green-400 text-black' : 'bg-gray-800'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          
          {/* Confirm Button */}
          <button 
            onClick={handleConfirmBooking}
            disabled={isBookingSubmitting}
            className={`w-full py-3 px-6 rounded-full flex items-center justify-between ${isBookingSubmitting ? 'opacity-70' : ''}`}
          >
            <div className="bg-green-400 text-black rounded-full p-2">
              {isBookingSubmitting ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChevronRight size={20} />
              )}
            </div>
            <span className="font-medium text-lg">{isBookingSubmitting ? 'Processing...' : 'Confirm Booking'}</span>
            <div className="flex">
              <ChevronRight size={16} className="text-gray-500" />
              <ChevronRight size={16} className="text-gray-500" />
              <ChevronRight size={16} className="text-gray-500" />
            </div>
          </button>
        </div>
      </div>
    );
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'browse':
        return renderBrowseScreen();
      case 'detail':
        return renderDetailScreen();
      case 'booking':
        return renderBookingScreen();
      default:
        return renderBrowseScreen();
    }
  };

  return (
    <div className="bg-gray-200 p-4 min-h-screen flex justify-center">
      <div className="relative max-w-md w-full h-[600px] overflow-hidden rounded-3xl shadow-2xl">
        {renderActiveScreen()}
      </div>
    </div>
  );
};

export default AfroGentsMobileApp;