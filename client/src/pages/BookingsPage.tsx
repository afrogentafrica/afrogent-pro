import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { requireAdmin } from '@/lib/auth';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import BookingsList from '@/components/dashboard/BookingsList';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, FilterIcon } from 'lucide-react';

const BookingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Determine API endpoint based on filters
  let queryKey = '/api/bookings';
  if (statusFilter) {
    queryKey = `/api/bookings/status/${statusFilter}`;
  } else if (dateRange.from && dateRange.to) {
    queryKey = `/api/bookings/date?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
  }

  // Fetch bookings data
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: [queryKey],
    retry: 1,
  });

  const clearFilters = () => {
    setStatusFilter(null);
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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

      <div className="flex-1 flex flex-col">
        <TopNav setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Bookings</h1>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Filter by Status
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 bg-gray-800 border-gray-700 text-white">
                    <div className="flex flex-col space-y-2 p-2">
                      <Button 
                        variant={statusFilter === 'pending' ? 'default' : 'ghost'} 
                        onClick={() => setStatusFilter('pending')}
                        className="justify-start"
                      >
                        Pending
                      </Button>
                      <Button 
                        variant={statusFilter === 'confirmed' ? 'default' : 'ghost'} 
                        onClick={() => setStatusFilter('confirmed')}
                        className="justify-start"
                      >
                        Confirmed
                      </Button>
                      <Button 
                        variant={statusFilter === 'completed' ? 'default' : 'ghost'} 
                        onClick={() => setStatusFilter('completed')}
                        className="justify-start"
                      >
                        Completed
                      </Button>
                      <Button 
                        variant={statusFilter === 'cancelled' ? 'default' : 'ghost'} 
                        onClick={() => setStatusFilter('cancelled')}
                        className="justify-start"
                      >
                        Cancelled
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd")
                        )
                      ) : (
                        "Date Range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="bg-gray-800 text-white"
                    />
                  </PopoverContent>
                </Popover>

                {(statusFilter || dateRange.from) && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters}
                    className="text-white hover:bg-gray-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            <BookingsList isLoading={isLoading} bookings={bookingsData?.bookings || []} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default requireAdmin(BookingsPage);
