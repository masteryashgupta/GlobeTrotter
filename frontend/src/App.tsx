import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards';
import { LoginPage, SignUpPage } from './pages/AuthPages';
import { PlaceholderPage } from './pages/PlaceholderPage';

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

              {/* Public Shared Trip Token Route */}
              <Route
                path="/share/:token"
                element={
                  <PlaceholderPage
                    title="Shared Public Trip View"
                    part="Part C: Budget / Calendar / Share"
                    description="View shared public itinerary without requiring authentication."
                  />
                }
              />

              {/* Authenticated Protected Routes inside AppLayout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Dashboard" part="Part A: Auth & Dashboard" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="My Trips" part="Part A: Auth & Dashboard" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/new"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Create New Trip" part="Part A / B" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/build"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Itinerary Builder" part="Part B: Itinerary & Search" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/view"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="View Trip Details" part="Part B: Itinerary & Search" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/budget"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Trip Budget & Expenses" part="Part C: Budget & Share" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trips/:id/calendar"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Trip Calendar View" part="Part C: Calendar" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cities/search"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Search Cities" part="Part B: Itinerary & Search" />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activities/search"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PlaceholderPage title="Search Activities" part="Part B: Itinerary & Search" />
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
