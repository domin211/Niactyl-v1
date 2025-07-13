import React, { Suspense, useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import type { ReactNode } from 'react';

// Lazy loaded pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Auth'));
const Servers = React.lazy(() => import('./pages/Servers'));
const Profile = React.lazy(() => import('./pages/Profile'));
const CreateServer = React.lazy(() => import('./pages/CreateServer'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Earn = React.lazy(() => import('./pages/Earn'));
const Team = React.lazy(() => import('./pages/Team'));

// Global dashboard data context
export const AppContext = createContext<any>(null);

interface ProtectedRouteProps {
  children: ReactNode;
  isAuthed: boolean;
}

const ProtectedRoute = ({ children, isAuthed }: ProtectedRouteProps) => {
  return isAuthed ? <>{children}</> : <Navigate to="/auth" />;
};

const AuthRedirect = ({ isAuthed }: { isAuthed: boolean }) => {
  return isAuthed ? <Navigate to="/dashboard" /> : <Login />;
};

function App() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setDashboardData(data);
        setLoaded(true);
      })
      .catch(() => {
        setDashboardData(null);
        setLoaded(true);
      });
  }, []);

  if (!loaded) return null;

  const isAuthed = !!dashboardData;

  return (
    <AppContext.Provider value={dashboardData}>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthRedirect isAuthed={isAuthed} />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthed={isAuthed}>
                <Layout>
                  <Suspense fallback={null}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/servers"
            element={
              <ProtectedRoute isAuthed={isAuthed}>
                <Layout>
                  <Suspense fallback={null}>
                    <Servers />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/servers/create"
            element={
              <ProtectedRoute isAuthed={isAuthed}>
                <Layout>
                  <Suspense fallback={null}>
                    <CreateServer />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthed={isAuthed}>
                <Layout>
                  <Suspense fallback={null}>
                    <Profile />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute isAuthed={isAuthed}>
                <Layout>
                  <Suspense fallback={null}>
                    <Leaderboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/earn"
            element={
              <ProtectedRoute isAuthed={isAuthed}>
                <Layout>
                  <Suspense fallback={null}>
                    <Earn />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute isAuthed={isAuthed}>
                <Layout>
                  <Suspense fallback={null}>
                    <Team />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {dashboardData?.is_admin && (
            <Route
              path="/admin"
              element={
                <ProtectedRoute isAuthed={isAuthed}>
                  <Layout>
                    <Suspense fallback={null}>
                      <Admin />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
          )}

          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
