import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const Analytics = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyStats, setDailyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDailyStats = async (date) => {
    try {
      const token = localStorage.getItem('token');
      const formattedDate = format(date, 'dd');
      const formattedMonth = format(date, 'yyyy-MM');
      const response = await fetch(
        `http://localhost:5000/api/bookings/stats?date=${formattedDate}&month=${formattedMonth}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setDailyStats(data.stats);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    }
  };

  const fetchMonthlyStats = async (date) => {
    try {
      const token = localStorage.getItem('token');
      const formattedMonth = format(date, 'yyyy-MM');
      const response = await fetch(
        `http://localhost:5000/api/bookings/stats?month=${formattedMonth}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setMonthlyStats(data.stats);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDailyStats(selectedDate),
        fetchMonthlyStats(selectedDate)
      ]);
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);

  const StatsCard = ({ title, stats }) => {
    if (!stats) return null;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Other Payments</p>
              <p className="text-2xl font-bold">₹{stats.totalOtherPayment}</p>
              <p className="text-sm text-gray-500">Count: {stats.otherPaymentsCount}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold">₹{stats.totalPayments}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Payment Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Cash</p>
                <p className="text-xl font-bold">₹{stats.paymentStats.cash.totalAmount}</p>
                <p className="text-sm text-gray-500">Count: {stats.paymentStats.cash.count}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Card</p>
                <p className="text-xl font-bold">₹{stats.paymentStats.card.totalAmount}</p>
                <p className="text-sm text-gray-500">Count: {stats.paymentStats.card.count}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">UPI</p>
                <p className="text-xl font-bold">₹{stats.paymentStats.upi.totalAmount}</p>
                <p className="text-sm text-gray-500">Count: {stats.paymentStats.upi.count}</p>
              </div>
            </div>
          </div>

          {stats.dateRange && (
            <div className="text-sm text-gray-600 mt-4">
              <p>Period: {new Date(stats.dateRange.startDate).toLocaleDateString()} - {new Date(stats.dateRange.endDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Selected Date: {format(selectedDate, 'dd MMMM yyyy')}
          </p>
        </div>
        <div className="w-full md:w-auto">
          <input
            type="date"
            className="w-full md:w-64 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <StatsCard title="Daily Statistics" stats={dailyStats} />
          <StatsCard title="Monthly Statistics" stats={monthlyStats} />
        </div>
      )}
    </div>
  );
};

export default Analytics;