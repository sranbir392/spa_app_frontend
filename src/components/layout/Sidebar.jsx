// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  MessageSquare,
  BarChart,
  PersonStandingIcon,
  BarChart2,
  Calendar1,
  Wallet,
  CircleFadingPlus,
  ChartNoAxesCombined
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  
  // Define menu items with an additional access property
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      access: ['admin', 'employee'] // both admin and employee can access dashboard
    },
    {
      title: 'Employees',
      path: '/dashboard/employees',
      icon: <Users className="w-5 h-5" />,
      access: ['admin'] // only admin can access
    },
    {
      title: 'Create Bookings',
      path: '/dashboard/bookings',
      icon: <CircleFadingPlus className="w-5 h-5" />,
      access: ['admin', 'employee']
    },
    {
      title: 'Today Bookings',
      path: '/dashboard/today/bookings',
      icon: <Calendar1 className="w-5 h-5" />,
      access: ['admin', 'employee']
    },
    {
      title: 'Booking History',
      path: '/dashboard/monthly/report',
      icon: <CalendarDays className="w-5 h-5" />,
      access: ['admin']
    },
    {
      title: 'Massages',
      path: '/dashboard/massages',
      icon: <MessageSquare className="w-5 h-5" />,
      access: ['admin', 'employee']
    },
    {
      title: 'Analytics',
      path: '/dashboard/analytics',
      icon: <BarChart className="w-5 h-5" />,
      access: ['admin'] // only admin can access
    },
    {
      title:"Employee Stats",
      path:"/dashboard/employeestats",
      icon: <ChartNoAxesCombined className='w-5 h-5'/>,
      access:['admin']
    },
    {
      title: 'Expenses',
      path: '/dashboard/today/expenses',
      icon: <Wallet className="w-5 h-5" />,
      access: ['admin']
    },
    {
      title:"Client",
      path:"/dashboard/clients",
      icon: <PersonStandingIcon className='w-5 h-5'/>,
      access:['admin']
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.access.includes(role?.toLowerCase() || '')
  );

  return (
    <div className="w-52 min-h-screen bg-white shadow-lg">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">VIP SMS</h1>
      </div>
      <nav className="space-y-1 p-4">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;