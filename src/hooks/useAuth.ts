'use client'

import { useState, useEffect, useCallback } from 'react'
import { authService, User } from '@/services/authService'

export const useAuth = (walletAddress: string | null) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-login when wallet connects
  useEffect(() => {
    if (walletAddress && !user) {
      loginUser(walletAddress)
    } else if (!walletAddress) {
      setUser(null)
    }
  }, [walletAddress])

  const loginUser = async (address: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const userData = await authService.login(address, false)
      setUser(userData)
      // Store user in localStorage for persistence
      localStorage.setItem('monad_trivia_user', JSON.stringify(userData))
    } catch (err: any) {
      setError(err.message)
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: { username?: string; avatar_id?: number }) => {
    if (!walletAddress) {
      throw new Error('No wallet connected')
    }

    setIsLoading(true)
    setError(null)
    try {
      const updatedUser = await authService.updateProfile(walletAddress, updates)
      setUser(updatedUser)
      localStorage.setItem('monad_trivia_user', JSON.stringify(updatedUser))
      return updatedUser
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!walletAddress) return

    setIsLoading(true)
    setError(null)
    try {
      const userData = await authService.getProfile(walletAddress)
      setUser(userData)
      localStorage.setItem('monad_trivia_user', JSON.stringify(userData))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('monad_trivia_user')
  }

  return {
    user,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
    logout,
  }
}
