import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/* ── user store ─────────────────────────────────────────────── */
const USERS = [
  {
    email: 'jose.mendoza@nyu.edu',
    password: 'Admin123!',
    name: 'Admin',
    role: 'admin',
  },
  {
    email: 'hc2379@nyu.edu',
    password: 'Huisoo123',
    name: 'Hui Soo Chae',
    role: 'user',
  },
];

/* ── context ────────────────────────────────────────────────── */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('dps_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState(null);
  const isAuthenticated = user !== null;
  const isLoading = false; // no async bootstrap needed

  const login = useCallback(async (email, password) => {
    setError(null);
    const found = USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      const msg = 'Invalid email or password';
      setError(msg);
      throw new Error(msg);
    }
    const { password: _, ...safeUser } = found;
    sessionStorage.setItem('dps_user', JSON.stringify(safeUser));
    setUser(safeUser);
  }, []);

  const logout = useCallback(async () => {
    sessionStorage.removeItem('dps_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, error, login, logout }),
    [user, isAuthenticated, isLoading, error, login, logout]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return React.createElement(Navigate, { to: '/login', replace: true });
  return React.createElement(Outlet);
}
