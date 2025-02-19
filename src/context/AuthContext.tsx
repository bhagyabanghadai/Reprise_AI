'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token')
    if (token) {
      // For demo, create a mock user
      setUser({
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User'
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Please provide both email and password')
    }

    try {
      // For demo purposes, accept any email/password
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0]
      }

      // Store token and user data
      localStorage.setItem('token', 'demo-token')
      setUser(mockUser)

      // Set cookie for middleware
      document.cookie = `auth_token=demo-token; path=/`
    } catch (error) {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}