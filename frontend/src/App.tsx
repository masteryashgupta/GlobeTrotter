import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
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
                      <DashboardPage />
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
                      <PlaceholderPage title="User Settings & Profile" part="Part D: Settings & Admin" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Admin Panel" part="Part D: Settings & Admin" />
                    </AppLayout>
                  </ProtectedRoute>
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
