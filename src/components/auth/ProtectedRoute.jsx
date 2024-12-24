// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = ['admin', 'employee'] }) => {
  const role = localStorage.getItem('role')?.toLowerCase();
  
  if (!role) {
    // Redirect to login if no role is found
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to dashboard if role is not allowed
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;