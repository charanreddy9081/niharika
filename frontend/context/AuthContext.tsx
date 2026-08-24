'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
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

const STORAGE_KEY = 'nha_auth_user';
const ACCOUNTS_KEY = 'nha_accounts'; // local account store (no backend yet)

// Simple hash for demo — NOT cryptographically secure; replace with backend auth
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      // ignore corrupt storage
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const accounts: Record<string, { user: AuthUser; passwordHash: string }> =
        JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
      const key = email.toLowerCase().trim();
      const account = accounts[key];

      if (!account) return { success: false, message: 'No account found with this email. Please register first.' };
      if (account.passwordHash !== simpleHash(password)) return { success: false, message: 'Incorrect password.' };

      setUser(account.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
      return { success: true, message: 'Welcome back!' };
    } catch {
      return { success: false, message: 'Sign in failed. Please try again.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const accounts: Record<string, { user: AuthUser; passwordHash: string }> =
        JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
      const key = data.email.toLowerCase().trim();

      if (accounts[key]) return { success: false, message: 'An account with this email already exists. Please sign in.' };

      const newUser: AuthUser = {
        id: `usr_${Date.now()}`,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: key,
        phone: data.phone?.trim(),
        createdAt: new Date().toISOString(),
      };

      accounts[key] = { user: newUser, passwordHash: simpleHash(data.password) };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return { success: true, message: 'Account created successfully!' };
    } catch {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
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
