import { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeStats = () => {
  // State for statistics data
  const [stats, setStats] = useState({
    dailyStats: [],
    monthlyStats: [],
    dailyTotals: {
      totalDailyBookingCount: 0,
      totalDailyMassagePayment: 0,
      totalDailyOtherPayment: 0,
      dailyBookings: [],
      dailyRange: { startOfDay: null, endOfDay: null }
    },
    monthlyTotals: {
      totalMonthlyBookingCount: 0,
      totalMonthlyMassagePayment: 0,
      totalMonthlyOtherPayment: 0,
      monthlyBookings: [],
      monthlyRange: { startOfMonth: null, endOfMonth: null }
    }
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');
  
  // Filter state - using a single date selector
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // Employees data
  const [employees, setEmployees] = useState([]);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  // Get month from selected date
  const getSelectedMonth = () => {
    return selectedDate.slice(0, 7); // YYYY-MM format
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch stats when filters change
  useEffect(() => {
    fetchEmployeeStats();
  }, [selectedDate, selectedEmployeeId]);

  // Fetch employees list
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const response = await axios.get(
        `${import.meta.env.VITE_END_POINT}/admin/employees`, 
        config
      );
      
      if (response.data && response.data.employees) {
        const nonAdminEmployees = response.data.employees.filter(
          employee => employee.role !== 'admin' && employee.role !== 'ADMIN'
        );
        setEmployees(nonAdminEmployees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch employee booking statistics
  const fetchEmployeeStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Build query parameters with the month derived from selectedDate
      const selectedMonth = getSelectedMonth();
      let url = `${import.meta.env.VITE_END_POINT}/bookings/stats/employee?date=${selectedDate}&month=${selectedMonth}`;
      
      // Add employee filter if selected - using employee name (as the backend expects)
      if (selectedEmployeeId) {
        const selectedEmployee = employees.find(emp => emp._id === selectedEmployeeId);
        if (selectedEmployee?.name) {
          url += `&employeeName=${encodeURIComponent(selectedEmployee.name)}`;
        }
      }
      
      const response = await axios.get(url, config);
      console.log('API Response:', response.data);
      
      // Ensure the response has the expected structure or provide defaults
      const responseData = {
        dailyStats: response.data.dailyStats || [],
        monthlyStats: response.data.monthlyStats || [],
        dailyTotals: response.data.dailyTotals || {
          totalDailyBookingCount: 0,
          totalDailyMassagePayment: 0,
          totalDailyOtherPayment: 0,
          dailyBookings: [],
          dailyRange: { startOfDay: null, endOfDay: null }
        },
        monthlyTotals: response.data.monthlyTotals || {
          totalMonthlyBookingCount: 0,
          totalMonthlyMassagePayment: 0,
          totalMonthlyOtherPayment: 0,
          monthlyBookings: [],
          monthlyRange: { startOfMonth: null, endOfMonth: null }
        }
      };
      
      // Process the bookings to ensure client names are properly displayed
      if (responseData.dailyTotals.dailyBookings) {
        responseData.dailyTotals.dailyBookings = responseData.dailyTotals.dailyBookings.map(booking => ({
          ...booking,
          clientName: booking.clientName || 'Unknown Client'
        }));
      }
      
      setStats(responseData);
    } catch (err) {
      console.error('Error fetching employee stats:', err);
      setError('Failed to fetch employee statistics. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for formatting
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + (parseFloat(amount) || 0).toLocaleString('en-IN');
  };

  const getEmployeeName = (employeeId) => {
    // Find employee in our employees array
    const employeeFromList = employees.find(emp => emp._id === employeeId);
    if (employeeFromList) {
      return employeeFromList.name;
    }
    
    // If no name is found, return the ID or a fallback
    return 'Unknown Employee';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-semibold">Loading employee statistics...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Booking Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Date Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Select Date</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="mt-2 text-sm text-gray-600">
              Selected Month: {new Date(getSelectedMonth() + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Filter by Employee</h2>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Employees</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Daily Stats Summary */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Daily Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold">
                {stats.dailyTotals?.totalDailyBookingCount || 0}
              </div>
              <div className="text-gray-600">Total Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {formatCurrency(
                  (stats.dailyTotals?.totalDailyMassagePayment || 0) + 
                  (stats.dailyTotals?.totalDailyOtherPayment || 0)
                )}
              </div>
              <div className="text-gray-600">Total Revenue</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-gray-600 mb-1">Date:</div>
            <div className="font-medium">{formatDate(selectedDate)}</div>
            {/* <div className="text-xs text-gray-500 mt-1">
              {stats.dailyTotals?.dailyRange?.startOfDay && 
               stats.dailyTotals?.dailyRange?.endOfDay && 
                `Range: ${formatDate(stats.dailyTotals.dailyRange.startOfDay)} - ${formatDate(stats.dailyTotals.dailyRange.endOfDay)}`}
            </div> */}
          </div>
          {selectedEmployeeId && (
            <div className="mt-2 p-2 bg-blue-50 rounded">
              <span className="text-gray-600">Filtered by: </span>
              <span className="font-medium">
                {getEmployeeName(selectedEmployeeId)}
              </span>
            </div>
          )}
          <button 
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => {
              setSelectedBookings(stats.dailyTotals?.dailyBookings || []);
              setSelectedPeriod('daily');
              setSelectedEmployee({ name: 'All Employees' });
              setModalOpen(true);
            }}
            disabled={!(stats.dailyTotals?.dailyBookings?.length)}
          >
            View All Daily Bookings
          </button>
        </div>
        
        {/* Monthly Stats Summary */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Monthly Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold">
                {stats.monthlyTotals?.totalMonthlyBookingCount || 0}
              </div>
              <div className="text-gray-600">Total Bookings</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {formatCurrency(
                  (stats.monthlyTotals?.totalMonthlyMassagePayment || 0) + 
                  (stats.monthlyTotals?.totalMonthlyOtherPayment || 0)
                )}
              </div>
              <div className="text-gray-600">Total Revenue</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-gray-600 mb-1">Month:</div>
            <div className="font-medium">{new Date(getSelectedMonth() + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
            {/* <div className="text-xs text-gray-500 mt-1">
              {stats.monthlyTotals?.monthlyRange?.startOfMonth && 
               stats.monthlyTotals?.monthlyRange?.endOfMonth && 
                `Range: ${formatDate(stats.monthlyTotals.monthlyRange.startOfMonth)} - ${formatDate(stats.monthlyTotals.monthlyRange.endOfMonth)}`}
            </div> */}
          </div>
          
          <button 
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={() => {
              setSelectedBookings(stats.monthlyTotals?.monthlyBookings || []);
              setSelectedPeriod('monthly');
              setSelectedEmployee({ name: 'All Employees' });
              setModalOpen(true);
            }}
            disabled={!(stats.monthlyTotals?.monthlyBookings?.length)}
          >
            View All Monthly Bookings
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'daily' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily Stats
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'monthly' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Stats
        </button>
      </div>
      
      {/* Employee Stats Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'daily' ? (
            // Daily Stats Table
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Massage Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Other Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.dailyStats.length > 0 ? (
                  stats.dailyStats.every(emp => emp._id === null && emp.dailyBookingCount === 0) ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        {selectedEmployeeId ? 
                          `No bookings found for ${getEmployeeName(selectedEmployeeId)} on this date.` : 
                          'No daily booking data available for this date.'}
                      </td>
                    </tr>
                  ) : (
                    stats.dailyStats.map((employee) => (
                      <tr key={employee._id || 'empty-row'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {getEmployeeName(employee._id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{employee.dailyBookingCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{employee.dailyUniqueClients}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{formatCurrency(employee.dailyMassagePayment)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{formatCurrency(employee.dailyOtherPayment)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(employee.dailyMassagePayment + employee.dailyOtherPayment)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                            onClick={() => {
                              setSelectedEmployee({
                                _id: employee._id,
                                name: getEmployeeName(employee._id)
                              });
                              setSelectedBookings(employee.dailyBookings || []);
                              setSelectedPeriod('daily');
                              setModalOpen(true);
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {selectedEmployeeId ? 
                        `No bookings found for ${getEmployeeName(selectedEmployeeId)} on this date.` : 
                        'No daily booking data available for this date.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            // Monthly Stats Table
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique Clients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Massage Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Other Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.monthlyStats.length > 0 ? (
                  stats.monthlyStats.every(emp => emp._id === null && emp.monthlyBookingCount === 0) ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        {selectedEmployeeId ? 
                          `No bookings found for ${getEmployeeName(selectedEmployeeId)} in ${new Date(getSelectedMonth() + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}.` : 
                          'No monthly booking data available for this month.'}
                      </td>
                    </tr>
                  ) : (
                    stats.monthlyStats.map((employee) => (
                      <tr key={employee._id || 'empty-row'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {getEmployeeName(employee._id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{employee.monthlyBookingCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{employee.monthlyUniqueClients}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{formatCurrency(employee.monthlyMassagePayment)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{formatCurrency(employee.monthlyOtherPayment)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(employee.monthlyMassagePayment + employee.monthlyOtherPayment)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                            onClick={() => {
                              setSelectedEmployee({
                                _id: employee._id,
                                name: getEmployeeName(employee._id)
                              });
                              setSelectedBookings(employee.monthlyBookings || []);
                              setSelectedPeriod('monthly');
                              setModalOpen(true);
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {selectedEmployeeId ? 
                        `No bookings found for ${getEmployeeName(selectedEmployeeId)} in ${new Date(getSelectedMonth() + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}.` : 
                        'No monthly booking data available for this month.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {modalOpen && (
        <BookingDetailsModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          employee={selectedEmployee}
          bookings={selectedBookings}
          period={selectedPeriod}
        />
      )}
    </div>
  );
};

// Booking Details Modal Component
const BookingDetailsModal = ({ isOpen, onClose, employee, bookings, period }) => {
  if (!isOpen) return null;
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + (parseFloat(amount) || 0).toLocaleString('en-IN');
  };

  const calculateTotalRevenue = () => {
    return bookings.reduce((total, booking) => {
      return total + (parseFloat(booking.massagePrice) || 0) + (parseFloat(booking.otherPayment) || 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-screen overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {employee?.name || 'All'} - {period === 'daily' ? 'Daily' : 'Monthly'} Bookings
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="px-6 py-4 flex-grow overflow-y-auto">
                      {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Bookings</div>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Revenue</div>
              <div className="text-2xl font-bold">{formatCurrency(calculateTotalRevenue())}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Unique Clients</div>
              <div className="text-2xl font-bold">
                {new Set(bookings.map(b => b.clientContact || b.clientName)).size}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">Avg Booking Value</div>
              <div className="text-2xl font-bold">
                {formatCurrency(bookings.length ? calculateTotalRevenue() / bookings.length : 0)}
              </div>
            </div>
          </div>
          
          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Room</th>
                  <th className="p-2 text-left">Massage</th>
                  <th className="p-2 text-left">Client</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Cash</th>
                  <th className="p-2 text-left">Card</th>
                  <th className="p-2 text-left">UPI</th>
                  <th className="p-2 text-left">Other Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <tr key={booking._id || index} className="border-b">
                      <td className="p-2">{formatDate(booking.massageDate)}</td>
                      <td className="p-2">{formatTime12Hour(booking.massageTime)}</td>
                      <td className="p-2">Room {booking.roomNumber}</td>
                      <td className="p-2">{booking.massageType}</td>
                      <td className="p-2">{booking.clientName || 'Unknown Client'}</td>
                      <td className="p-2">{formatCurrency(booking.massagePrice)}</td>
                      <td className="p-2">{formatCurrency(booking.cash || 0)}</td>
                      <td className="p-2">{formatCurrency(booking.card || 0)}</td>
                      <td className="p-2">{formatCurrency(booking.upi || 0)}</td>
                      <td className="p-2">{formatCurrency(booking.otherPayment || 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-2 text-center text-gray-500">
                      No booking data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStats;