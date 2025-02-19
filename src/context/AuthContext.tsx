'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');

        if (!token) {
          const path = window.location.pathname;
          if (path !== '/login' && path !== '/signup' && path !== '/') {
            router.push('/login');
          }
          setIsLoading(false);
          return;
        }

        // For demo purposes, we'll create a mock user
        const mockUser = {
          id: '1',
          name: 'Demo User',
          email: 'demo@example.com'
        };

        setUser(mockUser);

        // Redirect if on auth pages
        const path = window.location.pathname;
        if (path === '/login' || path === '/signup') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // For demo purposes, we'll simulate a successful login
      if (email && password) {
        const mockUser = {
          id: '1',
          name: 'Demo User',
          email: email
        };

        // Store auth token in both localStorage and cookies
        localStorage.setItem('auth_token', 'mock_token');
        document.cookie = 'auth_token=mock_token; path=/';

        setUser(mockUser);

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);

      if (name && email && password) {
        const mockUser = {
          id: '1',
          name: name,
          email: email
        };

        // Store auth token in both localStorage and cookies
        localStorage.setItem('auth_token', 'mock_token');
        document.cookie = 'auth_token=mock_token; path=/';

        setUser(mockUser);

        toast({
          title: "Welcome to Reprise Fitness!",
          description: "Your account has been created successfully.",
        });

        router.push('/dashboard');
      } else {
        throw new Error('Invalid signup data');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      toast({
        title: "Signup failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    router.push('/');
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        signup,
        logout, 
        isAuthenticated: !!user,
        isLoading 
      }}
    >
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