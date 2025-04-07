import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
    
  // Get user info from UserContext
  const { user, loading } = useUser();

  if (loading) {
    return null;
  }
  
  // Redirect to login page if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // or render the children components
  return children;
};

export default ProtectedRoute;
