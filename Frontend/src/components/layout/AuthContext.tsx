import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout } from '../../api/edulite';

interface User {
  username: string;
  role: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ status: string; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // No need for useEffect to load from localStorage

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (res.status === 'success') {
      setToken(res.data.token);
      setUser(res.data.user);
      setRole(res.data.user.role);
      // Store in localStorage for dashboard and other pages
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      // If admin, ensure full_name is 'School Administrator'
      let userToStore = res.data.user;
      if (res.data.user.role === 'admin') {
        if (!userToStore.full_name || userToStore.full_name === 'User' || userToStore.full_name === 'Admin User') {
          userToStore = { ...userToStore, full_name: 'School Administrator' };
        }
      }
      localStorage.setItem('user', JSON.stringify(userToStore));
      return { status: 'success' };
    } else {
      setToken(null);
      setUser(null);
      setRole(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      return { status: 'error', error: res.error };
    }
  };

  const logout = () => {
    apiLogout();
    setToken(null);
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}; 