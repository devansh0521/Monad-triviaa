import { ethers } from 'ethers'

export interface User {
  id: number
  wallet_address: string
  username: string | null
  avatar_id: number | null
  premium: boolean
  created_at: string
  avatar?: {
    id: number
    name: string | null
    image_url: string | null
    nft_token_id: string | null
  } | null
  leaderboards?: any[]
  achievements?: any[]
}

export interface AuthResponse {
  message: string
  user: User
}

export interface Avatar {
  id: number
  name: string | null
  image_url: string | null
  nft_token_id: string | null
  available: boolean
}

class AuthService {
  private baseUrl = '/api/auth'

  /**
   * Sign a message with the user's wallet
   */
  async signMessage(address: string, message: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const signature = await signer.signMessage(message)
    return signature
  }

  /**
   * Register a new user
   */
  async register(
    wallet_address: string,
    username?: string,
    avatar_id?: number,
    withSignature = false
  ): Promise<User> {
    let signature: string | undefined
    let message: string | undefined

    if (withSignature) {
      message = `Register with MonadTrivia\nWallet: ${wallet_address}\nTimestamp: ${Date.now()}`
      signature = await this.signMessage(wallet_address, message)
    }

    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address,
        username,
        avatar_id,
        signature,
        message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data.user
  }

  /**
   * Login existing user
   */
  async login(wallet_address: string, withSignature = false): Promise<User> {
    let signature: string | undefined
    let message: string | undefined

    if (withSignature) {
      message = `Login to MonadTrivia\nWallet: ${wallet_address}\nTimestamp: ${Date.now()}`
      signature = await this.signMessage(wallet_address, message)
    }

    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address,
        signature,
        message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 404 && data.shouldRegister) {
        // Auto-register if user doesn't exist
        return this.register(wallet_address, undefined, undefined, withSignature)
      }
      throw new Error(data.error || 'Login failed')
    }

    return data.user
  }

  /**
   * Get user profile
   */
  async getProfile(wallet_address: string): Promise<User> {
    const response = await fetch(
      `${this.baseUrl}/profile?wallet_address=${encodeURIComponent(wallet_address)}`
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile')
    }

    return data.user
  }

  /**
   * Update user profile
   */
  async updateProfile(
    wallet_address: string,
    updates: { username?: string; avatar_id?: number }
  ): Promise<User> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address,
        ...updates,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile')
    }

    return data.user
  }

  /**
   * Get all available avatars
   */
  async getAvatars(): Promise<Avatar[]> {
    const response = await fetch('/api/avatars')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch avatars')
    }

    return data.avatars
  }
}

export const authService = new AuthService()
