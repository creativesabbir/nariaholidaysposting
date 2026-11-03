'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchAuthSession, fetchCurrentUser } from '@/lib/api';

const AuthContext = createContext({
  currentUser: null,
  isLoadingUser: false,
  isUserModalOpen: false,
  setIsUserModalOpen: () => {},
  updateUser: () => {},
  refreshUser: () => {}
});

export function AuthProvider({ children }) {
  // SSR-consistent initial state to prevent React hydration mismatch
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const authData = await fetchAuthSession();
      if (authData?.authenticated && authData?.user) {
        setCurrentUser(authData.user);
        try {
          sessionStorage.setItem('nh_user_cache', JSON.stringify(authData.user));
        } catch (e) {}
      } else {
        const u = await fetchCurrentUser();
        if (u && u.id) {
          setCurrentUser(u);
          try {
            sessionStorage.setItem('nh_user_cache', JSON.stringify(u));
          } catch (e) {}
        } else {
          setCurrentUser(null);
          try {
            sessionStorage.removeItem('nh_user_cache');
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Auth refresh warning:', err);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    // 1. Read from client session cache immediately after initial hydration
    try {
      const cached = sessionStorage.getItem('nh_user_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
          setIsLoadingUser(false);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh session in background
    refreshUser();
  }, [refreshUser]);

  const updateUser = (updatedData) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedData };
      try {
        sessionStorage.setItem('nh_user_cache', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoadingUser,
      isUserModalOpen,
      setIsUserModalOpen,
      updateUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

