import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authenticateStoredUser, saveStoredUser, getStoredUsers } from '../utils/userStorage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, mobile: string, pass: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  demoLogin: (role: 'super_admin' | 'admin' | 'staff' | 'customer') => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('csc_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      if (token.startsWith('local-token-')) {
        try {
          const storedUser = localStorage.getItem('csc_local_user');
          if (storedUser) {
            const parsed: User = JSON.parse(storedUser);
            // Verify active status
            const allUsers = getStoredUsers();
            const current = allUsers.find(u => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
            if (current && current.is_active === 0) {
              // User has been deactivated! Logout immediately.
              localStorage.removeItem('csc_token');
              localStorage.removeItem('csc_local_user');
              setToken(null);
              setUser(null);
            } else {
              setUser(current || parsed);
            }
          } else {
            localStorage.removeItem('csc_token');
            setToken(null);
          }
        } catch {
          localStorage.removeItem('csc_token');
          setToken(null);
        }
        setLoading(false);
        return;
      }

      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          if (data && data.is_active === 0) {
            localStorage.removeItem('csc_token');
            localStorage.removeItem('csc_local_user');
            setToken(null);
            setUser(null);
          } else {
            setUser(data);
            localStorage.setItem('csc_local_user', JSON.stringify(data));
          }
        })
        .catch(() => {
          // If backend fetch fails, restore local user session if present and active
          const storedUser = localStorage.getItem('csc_local_user');
          if (storedUser) {
            try {
              const parsed: User = JSON.parse(storedUser);
              const allUsers = getStoredUsers();
              const current = allUsers.find(u => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
              if (current && current.is_active === 0) {
                localStorage.removeItem('csc_token');
                localStorage.removeItem('csc_local_user');
                setToken(null);
                setUser(null);
              } else {
                setUser(current || parsed);
              }
              setLoading(false);
              return;
            } catch {}
          }
          localStorage.removeItem('csc_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const fallbackLogin = (email: string, pass: string) => {
    const res = authenticateStoredUser(email, pass);
    if (res.success && res.user) {
      const genToken = `local-token-${Date.now()}`;
      localStorage.setItem('csc_token', genToken);
      localStorage.setItem('csc_local_user', JSON.stringify(res.user));
      setToken(genToken);
      setUser(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Invalid email or password.' };
  };

  const fallbackRegister = (name: string, email: string, mobile: string, pass: string, address?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const existingUsers = getStoredUsers();

    if (existingUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email: cleanEmail,
      mobile,
      role: 'customer',
      address: address || '',
      is_active: 1,
      created_at: new Date().toISOString()
    };

    saveStoredUser(newUser, pass);

    const genToken = `local-token-${Date.now()}`;
    localStorage.setItem('csc_token', genToken);
    localStorage.setItem('csc_local_user', JSON.stringify(newUser));
    setToken(genToken);
    setUser(newUser);
    return { success: true };
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('csc_token', data.token);
          if (data.user) {
            localStorage.setItem('csc_local_user', JSON.stringify(data.user));
          }
          setToken(data.token);
          setUser(data.user);
          return { success: true };
        } else {
          if (data.error && data.error.includes('deactivated')) {
            return { success: false, error: data.error };
          }
          const fallbackRes = fallbackLogin(email, pass);
          if (fallbackRes.success) {
            return fallbackRes;
          }
          return { success: false, error: data.error || 'Invalid email or password.' };
        }
      }
      throw new Error('Backend API unavailable');
    } catch (err: any) {
      return fallbackLogin(email, pass);
    }
  };

  const register = async (name: string, email: string, mobile: string, pass: string, address?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, password: pass, address })
      });
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('csc_token', data.token);
          if (data.user) {
            localStorage.setItem('csc_local_user', JSON.stringify(data.user));
          }
          setToken(data.token);
          setUser(data.user);
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Registration failed' };
        }
      }
      throw new Error('Backend API unavailable');
    } catch (err: any) {
      console.warn('Backend register API unreachable, using static fallback registration:', err);
      return fallbackRegister(name, email, mobile, pass, address);
    }
  };

  const logout = () => {
    localStorage.removeItem('csc_token');
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role: 'super_admin' | 'admin' | 'staff' | 'customer') => {
    const creds = {
      super_admin: { email: 'superadmin@csc.com', pass: 'superadmin123' },
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
