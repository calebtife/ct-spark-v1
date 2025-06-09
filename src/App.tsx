import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Home from './pages/Home';

// Lazy load components for better performance
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const EnhancedDashboardPage = lazy(() => import('./pages/EnhancedDashboard'));
const LoginPage = lazy(() => import('./pages/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const UserManagementPage = lazy(() => import('./pages/UserManagement'));
const PaymentPage = lazy(() => import('./pages/Payment'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const ContactUsPage = lazy(() => import('./pages/ContactUs'));
const HistoryPage = lazy(() => import('./pages/History'));
const DepositPage = lazy(() => import('./pages/Deposit'));
const EnhancedDepositPage = lazy(() => import('./pages/EnhancedDeposit'));
const LocationsPage = lazy(() => import('./pages/Locations'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboard'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const AboutPage = lazy(() => import('./pages/About'));

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Toaster position="top-right" />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <EnhancedDashboardPage />
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
            <Route path="/history" element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/deposit" element={
              <ProtectedRoute>
                <EnhancedDepositPage />
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