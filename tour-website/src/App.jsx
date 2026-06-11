import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import Packages from './pages/Packages';
import Transportation from './pages/Transportation';
import PackageDetails from './pages/PackageDetails';
import Booking from './pages/Booking';
import About from './pages/About';
import DestinationDetails from './pages/DestinationDetails';
import DestinationBooking from './pages/DestinationBooking';
import DynamicDestination from './pages/DynamicDestination';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import HotelBooking from './pages/HotelBooking';
import AITripResult from './pages/AITripResult';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ScrollToTop from './components/common/ScrollToTop';

function AppContent() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previousTheme) => (previousTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app">
      {/* ScrollToTop must be inside AppContent so useLocation() works correctly */}
      <ScrollToTop />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(148, 163, 184, 0.18)',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.35)',
          },
        }}
      />

      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destination/:id" element={<DestinationDetails />} />
          <Route path="/destination/:id/book" element={<DestinationBooking />} />
          <Route path="/dynamic-destination/:slug" element={<DynamicDestination />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/hotels/:id/book" element={<HotelBooking />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/ai-trip-result/:id" element={<AITripResult />} />
          <Route path="/about" element={<About />} />
          <Route path="/transportation" element={<Transportation />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Navigate to="/signup" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/profile"
            element={(
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/*"
            element={(
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
