import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Skeleton variant="rectangular" width={180} height={40} className="mb-4" />
        <Skeleton variant="text" width={240} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Skeleton variant="rectangular" width={180} height={40} className="mb-4" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * AdminRoute — wraps ProtectedRoute and additionally checks profile.is_admin.
 * Non-admins are redirected to /dashboard with state { adminDenied: true }
 * so the dashboard can surface a Toast explaining the restriction.
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Skeleton variant="rectangular" width={180} height={40} className="mb-4" />
        <Skeleton variant="text" width={240} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // profile may still be loading briefly; if it resolves to non-admin, redirect
  if (profile && !profile.is_admin) {
    return <Navigate to="/dashboard" state={{ adminDenied: true }} replace />;
  }

  // profile === null means still loading — show skeleton until resolved
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Skeleton variant="rectangular" width={180} height={40} className="mb-4" />
        <Skeleton variant="text" width={240} />
      </div>
    );
  }

  return <>{children}</>;
};

