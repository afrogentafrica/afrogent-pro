import React, { useState } from 'react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Booking {
  id: number;
  clientName: string;
  clientContact: string;
  service: {
    id: number;
    name: string;
    price: string;
  };
  stylist: {
    id: number;
    name: string;
  };
  date: string;
  timeStart: string;
  timeEnd: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentMethod: string;
  paymentStatus: string;
  clientLocation?: string;
}

interface BookingsListProps {
  isLoading: boolean;
  bookings: Booking[];
}

const BookingsList: React.FC<BookingsListProps> = ({ isLoading, bookings }) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 4;

  // Calculate pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800'; 
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (bookingId: number, status: string) => {
    try {
      await apiRequest('PUT', `/api/bookings/${bookingId}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: 'Status updated',
        description: `Booking status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update booking status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow">
      <div className="px-5 pt-5 pb-3 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Recent Bookings</h2>
        <button className="text-blue-500 text-sm hover:text-blue-400">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700 bg-opacity-50">
            <tr>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Service</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stylist</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date & Time</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 bg-gray-800">
            {isLoading ? (
              Array(4).fill(0).map((_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-24 bg-gray-700" />
                        <Skeleton className="h-3 w-20 bg-gray-700 mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-28 bg-gray-700" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-28 bg-gray-700" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-20 bg-gray-700" />
                    <Skeleton className="h-3 w-16 bg-gray-700 mt-1" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-16 bg-gray-700" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-20 rounded-full bg-gray-700" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-16 bg-gray-700 inline-block mr-2" />
                    <Skeleton className="h-4 w-16 bg-gray-700 inline-block" />
                  </td>
                </tr>
              ))
            ) : currentBookings.length > 0 ? (
              currentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${booking.clientName.replace(/\s+/g, '+')}&background=4338CA&color=fff`} 
                          alt={booking.clientName} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{booking.clientName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{booking.clientContact}</p>
                        {booking.clientLocation && (
                          <p className="text-xs text-gray-400 mt-0.5">{booking.clientLocation}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-sm text-white">{booking.service?.name || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-sm text-white">{booking.stylist?.name || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-sm text-white">{formatDate(booking.date)}</p>
                    <p className="text-xs text-gray-400">
                      {booking.timeStart} - {booking.timeEnd}
                    </p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="text-sm text-white font-medium">${booking.service?.price}</p>
                    <p className="text-xs text-gray-400">{booking.paymentMethod || 'Cash'}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end">
                      <select 
                        className="bg-gray-700 text-white text-xs rounded border border-gray-600 mr-2 px-2 py-1"
                        value={booking.status}
                        onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirm</option>
                        <option value="completed">Complete</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                      <button className="text-gray-400 hover:text-gray-300 text-xs">Details</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {!isLoading && bookings.length > 0 && (
        <div className="bg-gray-800 px-5 py-3">
          <nav className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastBooking, bookings.length)}</span> of{' '}
                  <span className="font-medium">{bookings.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === i + 1
                          ? 'bg-gray-900 text-gray-100 border-gray-700'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                      } text-sm font-medium`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
