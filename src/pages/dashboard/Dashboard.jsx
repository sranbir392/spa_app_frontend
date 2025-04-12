// src/pages/dashboard/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CalendarDays, 
  MessageSquare,
  BarChart,
  MessageSquareDot,
  Calendar1,
  ChartNoAxesCombined,
  Wallet
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role')?.toLowerCase();
  const userName = localStorage.getItem('name') || 'User';

  // Define navigation cards with role-based access
  const navigationCards = [
    {
      title: 'Manage Employees',
      description: 'View and manage employee information',
      icon: <Users className="h-6 w-6" />,
      path: '/dashboard/employees',
      access: ['admin'],
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Bookings',
      description: 'Create service bookings',
      icon: <Calendar1 className="h-6 w-6" />,
      path: '/dashboard/bookings',
      access: ['admin', 'employee'],
      bgColor: 'bg-green-100'
    },
    {
      title: 'Monthly Bookings',
      description: 'View Monthly bookings',
      icon: <CalendarDays className="h-6 w-6" />,
      path: '/dashboard/monthly/report',
      access: ['admin'],
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Massages',
      description: 'Massage Center',
      icon: <MessageSquareDot className="h-6 w-6" />,
      path: '/dashboard/massages',
      access: ['admin', 'employee'],
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Analytics',
      description: 'View business analytics and reports',
      icon: <BarChart className="h-6 w-6" />,
      path: '/dashboard/analytics',
      access: ['admin'],
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Expense',
      description: 'Create Today Expenses',
      icon: <Wallet className="h-6 w-6" />,
      path: '/dashboard/today/expenses',
      access: ['admin'],
      bgColor: 'bg-teal-100'
    },
    {
      title: 'Employee Analytics',
      description: 'View Employee performance',
      icon: <ChartNoAxesCombined className="h-6 w-6" />,
      path: '/dashboard/employeestats',
      access: ['admin'],
      bgColor: 'bg-grey-100'
    }
  ];

  // Filter cards based on user role
  const filteredCards = navigationCards.filter(card => 
    card.access.includes(role)
  );

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-gray-600">
          {role === 'admin' 
            ? 'Manage your business and team from here'
            : 'Access your tasks and communications from here'}
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => (
          <div
            key={card.path}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => navigate(card.path)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 ${card.bgColor} rounded-lg`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Section - Only for Admin */}
      {/* {role === 'admin' && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-2">Total Employees</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-2">Today's Bookings</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
          
        </div>
      )} */}
    </div>
  );
};

export default Dashboard;