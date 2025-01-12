import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TodayBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPriceAmount, setNewPriceAmount] = useState('');
  const userRole = localStorage.getItem('role');

  const formatTime = (time) => {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const fetchBookings = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_END_POINT}/bookings/date/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setBookings(response.data.bookings);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_END_POINT}/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchBookings(selectedDate);
    } catch (err) {
      setError('Failed to delete booking. Please try again.');
      console.error('Error deleting booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtherPaymentUpdate = async (bookingId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_END_POINT}/bookings/${bookingId}/otherPayment`,
        { otherPayment: parseFloat(newPaymentAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchBookings(selectedDate);
      setEditingPayment(null);
      setNewPaymentAmount('');
    } catch (err) {
      setError('Failed to update other payment. Please try again.');
      console.error('Error updating other payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceUpdate = async (bookingId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${import.meta.env.VITE_END_POINT}/bookings/${bookingId}`,
        { massagePrice: parseFloat(newPriceAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchBookings(selectedDate);
      setEditingPrice(null);
      setNewPriceAmount('');
    } catch (err) {
      setError('Failed to update price. Please try again.');
      console.error('Error updating price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'employee') {
      const today = new Date();
      const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      setSelectedDate(localDate);
    }
    fetchBookings(selectedDate);
  }, [selectedDate, userRole]);

  return (
    <div className="container mx-auto">
      {userRole !== 'employee' && (
        <div className="mb-6">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-md w-48"
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No bookings found for this date.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Massage Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                {userRole === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.clientContact}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.massage.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.sessionTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingPrice === booking._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newPriceAmount}
                          onChange={(e) => setNewPriceAmount(e.target.value)}
                          className="w-20 p-1 border rounded"
                        />
                        <button
                          onClick={() => handlePriceUpdate(booking._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingPrice(null);
                            setNewPriceAmount('');
                          }}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        ₹{booking.massagePrice}
                        <button
                          onClick={() => {
                            setEditingPrice(booking._id);
                            setNewPriceAmount(booking.massagePrice?.toString() || '');
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingPayment === booking._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newPaymentAmount}
                          onChange={(e) => setNewPaymentAmount(e.target.value)}
                          className="w-20 p-1 border rounded"
                        />
                        <button
                          onClick={() => handleOtherPaymentUpdate(booking._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingPayment(null);
                            setNewPaymentAmount('');
                          }}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        ₹{booking.otherPayment || '0'}
                        <button
                          onClick={() => {
                            setEditingPayment(booking._id);
                            setNewPaymentAmount(booking.otherPayment?.toString() || '');
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.paymentMode || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatTime(booking.massageTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatTime(booking.massageEndTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.createdBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.roomNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking?.staffDetails?.name}</td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TodayBookings;