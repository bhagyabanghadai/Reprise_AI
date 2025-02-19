'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie.includes('auth_token=demo-token')
      if (token) {
        // If we have a token, set the user
        const savedEmail = localStorage.getItem('user_email')
        if (savedEmail) {
          setUser({
            id: '1',
            email: savedEmail,
            name: savedEmail.split('@')[0]
          })
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Mock authentication - in a real app, this would be an API call
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0]
      }

      // Store email for session persistence
      localStorage.setItem('user_email', email)

      // Set user in state
      setUser(mockUser)

      // Return to allow the login page to handle redirection
      return
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    // Clear authentication
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    localStorage.removeItem('user_email')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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