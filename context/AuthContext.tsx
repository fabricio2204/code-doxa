'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, UserRole } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for development
const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@cafeteria.com',
    role: 'admin',
    password: 'admin123',
  },
  {
    id: '2',
    name: 'Gerente',
    email: 'gerente@cafeteria.com',
    role: 'gerente',
    password: 'gerente123',
  },
  {
    id: '3',
    name: 'Atendente',
    email: 'atendente@cafeteria.com',
    role: 'atendente',
    password: 'atendente123',
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call
    const foundUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (foundUser) {
      const userWithoutPassword = { ...foundUser }
      delete userWithoutPassword.password
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false
    
    // Admin has access to everything
    if (user.role === 'admin') return true
    
    // Gerente has access to gerente and atendente roles
    if (user.role === 'gerente' && (role === 'gerente' || role === 'atendente')) {
      return true
    }
    
    // Check exact role match
    return user.role === role
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
