import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PartnerPortal from './components/PartnerPortal';
import PartnerMobileApp from './components/PartnerMobileApp';
import AdminDashboard from './components/AdminDashboard';
import UserWebsite from './components/UserWebsite';
import { User as UserType } from './types';
import { authService } from './services/authService';

// Custom hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for logged in user
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Redirect based on role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.user_type === 'admin' && !location.pathname.startsWith('/admin')) {
        navigate('/admin');
      } else if (currentUser.user_type === 'restaurant' && !location.pathname.startsWith('/partner')) {
        navigate('/partner');
      }
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const handleUserUpdate = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    authService.saveSession(updatedUser);
  };

  return (
    <Routes>
      {/* Admin Route */}
      <Route path="/admin" element={
        currentUser?.user_type === 'admin' ? (
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
        ) : (
          <Navigate to="/" replace />
        )
      } />

      {/* Partner Route */}
      <Route path="/partner" element={
        currentUser?.user_type === 'restaurant' ? (
          isMobile ? (
            <PartnerMobileApp user={currentUser} onLogout={handleLogout} />
          ) : (
            <PartnerPortal user={currentUser} onLogout={handleLogout} />
          )
        ) : (
          <Navigate to="/" replace />
        )
      } />

      {/* Default User Website Route */}
      <Route path="/*" element={
        <UserWebsite
          currentUser={currentUser}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      } />
    </Routes>
  );
}

export default App;
