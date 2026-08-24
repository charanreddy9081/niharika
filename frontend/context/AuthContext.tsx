'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = 'nha_user_token';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  signOut: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: verify stored token with backend
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setIsLoading(false); return; }

    fetch(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Token invalid/expired — clear it
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => {
        // Network error — keep token, try again next load
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return { success: true, message: data.message || 'Welcome back!' };
      }
      return { success: false, message: data.message || 'Sign in failed.' };
    } catch {
      return { success: false, message: 'Could not reach server. Please try again.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await fetch(`${API}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.trim(),
          phone: data.phone || '',
          password: data.password,
        }),
      });
      const result = await res.json();
      if (result.success && result.token) {
        localStorage.setItem(TOKEN_KEY, result.token);
        setUser(result.user);
        return { success: true, message: result.message || 'Account created!' };
      }
      return { success: false, message: result.message || 'Registration failed.' };
    } catch {
      return { success: false, message: 'Could not reach server. Please try again.' };
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    // Fire-and-forget backend logout
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch(`${API}/api/users/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isGuest: !user,
      isLoading,
      signIn,
      register,
      signOut,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
