// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Employees from './pages/dashboard/Employees';
import Bookings from './pages/dashboard/Bookings';
import Massages from './pages/dashboard/Massages';
import Analytics from './pages/dashboard/Analytics';
import Login from './pages/auth/LoginPage';
import TodayBookings from './pages/dashboard/TodayBookings';
import Clients from './pages/dashboard/Clients';
import ClientDetails from './pages/dashboard/ClientDetails';
import Expenses from './pages/dashboard/Exepenses';
import MonthlyReport from './pages/dashboard/MonthlyReport';
import EmployeeStats from './pages/dashboard/EmployeeStats';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard Layout with Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard index route */}
          <Route index element={<Dashboard />} />
          
          {/* Admin only routes */}
          <Route
            path="employees"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="today/expenses"
            element={
              <ProtectedRoute>
                <Expenses/>
              </ProtectedRoute>
            }
          />
          <Route
            path="monthly/report"
            element={
              <ProtectedRoute>
                <MonthlyReport/>
              </ProtectedRoute>
            }
          />
          
          {/* Common routes for both admin and employee */}
          <Route
            path="bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="today/bookings"
            element={
              <ProtectedRoute>
                <TodayBookings/>
              </ProtectedRoute>
            }
          />
          <Route
            path="employeestats"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EmployeeStats />
              </ProtectedRoute>
            }
          />
           <Route path='client/:id' element={<ProtectedRoute><ClientDetails/></ProtectedRoute>}/>
        
          <Route
            path="clients"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Clients/>
              </ProtectedRoute>
            }
          />
         
          <Route
            path="massages"
            element={
              <ProtectedRoute >
                <Massages />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;