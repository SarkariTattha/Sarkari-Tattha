import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, mobile: string, pass: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  demoLogin: (role: 'admin' | 'staff' | 'customer') => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('csc_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('csc_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      localStorage.setItem('csc_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error. Failed to login.' };
    }
  };

  const register = async (name: string, email: string, mobile: string, pass: string, address?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password: pass, address })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };

      localStorage.setItem('csc_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error. Failed to register.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('csc_token');
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role: 'admin' | 'staff' | 'customer') => {
    const creds = {
      admin: { email: 'admin@csc.com', pass: 'admin123' },
      staff: { email: 'staff@csc.com', pass: 'staff123' },
      customer: { email: 'customer@csc.com', pass: 'customer123' }
    };
    const c = creds[role];
    await login(c.email, c.pass);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
