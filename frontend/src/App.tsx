import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './components/ui';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicRoute, AdminRoute } from './routes/RouteGuards';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { BudgetPage } from './pages/BudgetPage';
import { CalendarPage } from './pages/CalendarPage';
import { SharedTripPage } from './pages/SharedTripPage';
import { CitySearchPage } from './pages/CitySearchPage';
import { ActivitySearchPage } from './pages/ActivitySearchPage';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { ItineraryViewPage } from './pages/ItineraryViewPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Wrapper for /dashboard that renders DashboardPage and fires a Toast if redirected
 * from AdminRoute with state { adminDenied: true }.
 */
function DashboardWithAdminDeniedToast() {
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    if ((location.state as any)?.adminDenied) {
      addToast('warning', 'Access Restricted', 'Admin panel is only accessible to platform administrators.');
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <DashboardPage />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Unauthenticated Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignUpPage />
                  </PublicRoute>
                }
              />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Public Shared Trip Token Route */}
              <Route path="/share/:token" element={<SharedTripPage />} />

              {/* Authenticated Protected Routes inside AppLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardWithAdminDeniedToast />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MyTripsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/new"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CreateTripPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/build"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ItineraryBuilderPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/view"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ItineraryViewPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/budget"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BudgetPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/calendar"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CalendarPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/cities/search"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CitySearchPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activities/search"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ActivitySearchPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin-Only Route */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AppLayout>
                      <AdminPage />
                    </AppLayout>
                  </AdminRoute>
                }
              />

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
