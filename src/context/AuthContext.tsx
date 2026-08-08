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

const DEFAULT_STATIC_USERS: Record<string, { pass: string; user: User }> = {
  'admin@csc.com': {
    pass: 'admin123',
    user: { id: 1, name: 'Center Administrator', email: 'admin@csc.com', mobile: '9876543210', role: 'admin', address: 'Digital Seva Kendra HQ', created_at: new Date().toISOString() }
  },
  'staff@csc.com': {
    pass: 'staff123',
    user: { id: 2, name: 'Operator Staff', email: 'staff@csc.com', mobile: '9876543211', role: 'staff', address: 'Counter 1', created_at: new Date().toISOString() }
  },
  'customer@csc.com': {
    pass: 'customer123',
    user: { id: 3, name: 'Rahul Sharma', email: 'customer@csc.com', mobile: '9876543212', role: 'customer', address: 'Kolkata, WB', created_at: new Date().toISOString() }
  }
};

function getLocalRegisteredUsers(): Array<{ email: string; pass: string; user: User }> {
  try {
    const raw = localStorage.getItem('csc_registered_users');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

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
            setUser(JSON.parse(storedUser));
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
          setUser(data);
          localStorage.setItem('csc_local_user', JSON.stringify(data));
        })
        .catch(() => {
          // If backend fetch fails (e.g. GitHub Pages static host), restore local user session if present
          const storedUser = localStorage.getItem('csc_local_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
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
    const cleanEmail = email.toLowerCase().trim();
    
    // Check static default accounts
    if (DEFAULT_STATIC_USERS[cleanEmail]) {
      const match = DEFAULT_STATIC_USERS[cleanEmail];
      if (match.pass === pass) {
        const genToken = `local-token-${Date.now()}`;
        localStorage.setItem('csc_token', genToken);
        localStorage.setItem('csc_local_user', JSON.stringify(match.user));
        setToken(genToken);
        setUser(match.user);
        return { success: true };
      }
    }

    // Check dynamically registered local users
    const registered = getLocalRegisteredUsers();
    const found = registered.find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (found.pass === pass) {
        const genToken = `local-token-${Date.now()}`;
        localStorage.setItem('csc_token', genToken);
        localStorage.setItem('csc_local_user', JSON.stringify(found.user));
        setToken(genToken);
        setUser(found.user);
        return { success: true };
      }
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const fallbackRegister = (name: string, email: string, mobile: string, pass: string, address?: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const registered = getLocalRegisteredUsers();

    if (DEFAULT_STATIC_USERS[cleanEmail] || registered.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email: cleanEmail,
      mobile,
      role: 'customer',
      address: address || '',
      created_at: new Date().toISOString()
    };

    registered.push({ email: cleanEmail, pass, user: newUser });
    try {
      localStorage.setItem('csc_registered_users', JSON.stringify(registered));
    } catch (e) {
      console.warn('Failed to save user to localStorage:', e);
    }

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
          return { success: false, error: data.error || 'Invalid credentials' };
        }
      }
      throw new Error('Backend API unavailable');
    } catch (err: any) {
      console.warn('Backend login API unreachable, using static fallback authentication:', err);
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
