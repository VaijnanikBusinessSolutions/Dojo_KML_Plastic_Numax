// src/components/routing/RequireAuth.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const RequireAuth: React.FC = () => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // While checking auth (e.g., during initial app load)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-600">
          <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Checking authentication...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and remember where the user was trying to go
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Authorized: render nested protected routes
  return <Outlet />;
};

export default RequireAuth;