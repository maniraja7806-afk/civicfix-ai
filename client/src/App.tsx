import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { AdminCommandCenter } from './pages/AdminCommandCenter';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { InteractiveMapPage } from './pages/InteractiveMapPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { DepartmentManagementPage } from './pages/DepartmentManagementPage';
import { PublicTransparencyPage } from './pages/PublicTransparencyPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AllComplaintsAdminPage } from './pages/AllComplaintsAdminPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-semibold text-sm">
        Authenticating CivicFix AI credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/map" element={<InteractiveMapPage />} />
              <Route path="/transparency" element={<PublicTransparencyPage />} />
              <Route path="/report" element={<ReportIssuePage />} />
              <Route path="/complaint/:id" element={<ComplaintDetailsPage />} />
            </Route>

            {/* Dashboard Protected Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
              <Route
                path="/dashboard/officer"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/assignments"
                element={
                  <ProtectedRoute allowedRoles={['officer', 'admin']}>
                    <OfficerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCommandCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminCommandCenter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AllComplaintsAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DepartmentManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/my-complaints" element={<MyComplaintsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
