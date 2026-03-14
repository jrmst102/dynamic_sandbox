import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/* ── user store ─────────────────────────────────────────────── */
const USERS = [
  { email: 'jose.mendoza@nyu.edu', password: 'Admin123!', name: 'Admin', role: 'admin' },
  { email: 'demo@nyu.edu', password: 'demo1234', name: 'Demo User', role: 'user' },
  { email: 'hc2379@nyu.edu', password: 'Huisoo123', name: 'Hui Soo Chae', role: 'user' },
  { email: 'hc3279@nyu.edu', password: 'Huisoo123', name: 'Hui Soo Chae', role: 'user' },
  { email: 'nsa258@nyu.edu', password: 'BlueCat258', name: 'Natasha Andaz', role: 'user' },
  { email: 'pb3263@nyu.edu', password: 'GreenFox3263', name: 'Patrick Brown Jr', role: 'user' },
  { email: 'elb8806@nyu.edu', password: 'WhiteLion8806', name: 'EL Burts', role: 'user' },
  { email: 'ahd9504@nyu.edu', password: 'BrownTiger9504', name: 'Amanda Diaz', role: 'user' },
  { email: 'eg4166@nyu.edu', password: 'RedHawk4166', name: 'Liz Gelardi Olson', role: 'user' },
  { email: 'ang6147@nyu.edu', password: 'YellowBear6147', name: 'Ariana Grillo', role: 'user' },
  { email: 'hpk234@nyu.edu', password: 'GrayDeer234', name: 'Howard Kastner', role: 'user' },
  { email: 'll6126@nyu.edu', password: 'PurpleDog6126', name: 'Leigh Labrie', role: 'user' },
  { email: 'bl4312@nyu.edu', password: 'PinkElephant4312', name: 'Brian Lee', role: 'user' },
  { email: 'eem363@nyu.edu', password: 'VioletEagle363', name: 'Erin Mincer', role: 'user' },
  { email: 'np3368@nyu.edu', password: 'BeigeCat3368', name: 'Nya-Gabriella Parchment', role: 'user' },
  { email: 'jdw9540@nyu.edu', password: 'TaupeOwl9540', name: 'Justin Winey', role: 'user' },
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
