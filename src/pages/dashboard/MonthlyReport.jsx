import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MonthlyReport = () => {
  // Get current month and year for default selection
  const current = new Date();
  const defaultMonth = `${current.getFullYear()}-${String(
    current.getMonth() + 1
  ).padStart(2, '0')}`;
  
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(defaultMonth);
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, month] = selectedDate.split('-');
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Fetch booking data whenever the month or year changes
  useEffect(() => {
    fetchBookingHistory();
  }, [selectedDate]);

  const fetchBookingHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_END_POINT}/bookings/clients/monthly-report?year=${year}&month=${parseInt(month)}`
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const count = data.result.reduce((total, item) => total + item.count, 0);
      
      // Calculate total revenue if the API provides revenue data
      const revenue = data.result.reduce((total, item) => total + (item.revenue || 0), 0);
      
      setTotalBookings(count);
      setTotalRevenue(revenue);
      setBookingData(data.result);
    } catch (err) {
      setError('Error fetching booking data');
      console.error('Error details:', err);
    }
    setLoading(false);
  };

  const generateCalendarCells = () => {
    const cells = [];
    // Determine the weekday of the 1st day of the month
    const firstDayOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1).getDay();
    // Total days in the selected month
    const totalDays = new Date(parseInt(year), parseInt(month), 0).getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    
    // Add each day number for the month
    for (let day = 1; day <= totalDays; day++) {
      cells.push(day);
    }
    
    return cells;
  };

  const calendarCells = generateCalendarCells();

  // Format month name for display
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });

  // Function to determine cell background color based on booking count
  const getCellColor = (count) => {
    if (count === 0) return 'bg-gray-50';
    if (count < 3) return 'bg-blue-50';
    if (count < 5) return 'bg-blue-100';
    return 'bg-blue-200';
  };

  // Get current day for highlighting today in calendar
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === parseInt(year) && today.getMonth() === parseInt(month) - 1;
  const currentDay = today.getDate();

  // Helper function to format date as YYYY-MM-DD
  const formatDateString = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Monthly Booking Report
      </h1>
      
      {/* Top controls and stats */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <label htmlFor="monthInput" className="mr-2 font-medium text-gray-700">
            Select Month:
          </label>
          <input
            id="monthInput"
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center min-w-32">
            <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600">{totalBookings}</p>
          </div>
          
        </div>
      </div>
      
      {/* Calendar header */}
      <h2 className="text-xl font-semibold text-center mb-6 text-gray-700">
        {`${monthName} ${year}`}
      </h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
          {error}
        </div>
      ) : (
        <div>
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div key={idx} className="text-center font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, index) => {
              if (cell === null) {
                return <div key={`empty-${index}`} className="h-24"></div>;
              }
              
              // Create the date string for this cell - ensure proper formatting
              const formattedDateString = formatDateString(year, parseInt(month), cell);
              
              // Find matching booking data for this day
              const bookingForDay = bookingData.find(
                (item) => item._id === formattedDateString
              );
              const bookingsCount = bookingForDay ? bookingForDay.count : 0;
              
              // Check if this is today
              const isToday = isCurrentMonth && cell === currentDay;
              
              return (
                <div
                  key={`day-${index}`}
                  role="button"
                  onClick={() => navigate(`/dashboard/today/bookings?date=${formattedDateString}`)}
                  className={`border ${isToday ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} 
                              rounded-md h-24 flex flex-col items-center justify-start p-2 
                              ${getCellColor(bookingsCount)} transition-all duration-200 
                              hover:shadow-md hover:scale-105 hover:z-10 cursor-pointer`}
                >
                  <div className={`text-lg w-8 h-8 rounded-full flex items-center justify-center
                                  ${isToday ? 'bg-blue-500 text-white font-bold' : 'font-medium'}`}>
                    {cell}
                  </div>
                  
                  <div className="text-center mt-2">
                    <div className={`font-medium ${bookingsCount > 0 ? 'text-blue-700' : 'text-gray-500'}`}>
                      {bookingsCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {bookingsCount === 1 ? 'booking' : 'bookings'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex justify-center items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-50 border border-gray-200 rounded mr-2"></div>
              <span>1-2 Bookings</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-gray-200 rounded mr-2"></div>
              <span>3-4 Bookings</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 border border-gray-200 rounded mr-2"></div>
              <span>5+ Bookings</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReport;