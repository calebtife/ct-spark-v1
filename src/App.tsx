import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Home from './pages/Home';

// Lazy load components for better performance
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const UserManagementPage = lazy(() => import('./pages/UserManagement'));
const PaymentPage = lazy(() => import('./pages/Payment'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const SupportPage = lazy(() => import('./pages/Support'));
const HistoryPage = lazy(() => import('./pages/History'));
const DepositPage = lazy(() => import('./pages/Deposit'));
const LocationsPage = lazy(() => import('./pages/Locations'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboard'));

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requireAdmin>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/deposit" element={
              <ProtectedRoute>
                <DepositPage />
              </ProtectedRoute>
            } />
            <Route path="/locations" element={
              <ProtectedRoute>
                <LocationsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
