'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface AuthContextType {
  user: {
    name: string;
    email: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const login = async (email: string, password: string) => {
    // Mock login function, replace with actual login logic
    setUser({ name: 'Demo User', email });
    console.log('Logged in:', email);
  };

  const logout = () => {
    // Mock logout function
    setUser(null);
    console.log('Logged out');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
