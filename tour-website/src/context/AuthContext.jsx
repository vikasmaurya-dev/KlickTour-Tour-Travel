/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  authService,
  clearAuthSession,
  getStoredUser,
  persistAuthSession,
} from '../services/authService';
import { getUserFirstName } from '../utils/googleAuth';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const hasStoredToken = Boolean(
        localStorage.getItem('klicktour_auth_token') || localStorage.getItem('token'),
      );

      if (!hasStoredToken) {
        setLoading(false);
        return;
      }

      try {
        const session = await authService.getMe();
        const normalized = persistAuthSession(session);
        setUser(normalized.user);
      } catch {
        clearAuthSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const completeAuth = (payload, fallbackMessage) => {
    const normalized = persistAuthSession(payload);
    setUser(normalized.user);

    if (normalized.message || fallbackMessage) {
      toast.success(normalized.message || fallbackMessage);
    }

    return normalized;
  };

  const initiateLogin = async (email, password) => authService.login({ email, password });

  const completeLogin = (payload) => completeAuth(payload, 'Signed in successfully.');

  const verifyLogin = async (email, otp) => completeAuth(
    await authService.verifyLogin(email, otp),
    'Signed in successfully.',
  );

  const initiateRegister = async (name, email, password) => authService.register({ name, email, password });

  const verifyRegister = async (email, otp) => completeAuth(
    await authService.verifyRegister(email, otp),
    'Account created successfully.',
  );

  const signInWithGoogle = async (credential) => completeAuth(
    await authService.googleAuth(credential),
    'Signed in with Google successfully.',
  );

  const resendOtp = async (email, purpose) => authService.resendOtp(email, purpose);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    toast.success('You have been logged out.');
  };

  const updateProfile = async (profileData) => completeAuth(
    await authService.updateProfile(profileData),
    'Profile updated successfully.',
  );

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      welcomeName: getUserFirstName(user?.name),
      logout,
      initiateLogin,
      verifyLogin,
      completeLogin,
      signInWithGoogle,
      initiateRegister,
      verifyRegister,
      resendOtp,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
