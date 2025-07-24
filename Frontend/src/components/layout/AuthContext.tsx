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
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedUser && storedRole) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    if (res.status === 'success') {
      setToken(res.data.token);
      setUser(res.data.user);
      setRole(res.data.role);
      return { status: 'success' };
    } else {
      setToken(null);
      setUser(null);
      setRole(null);
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