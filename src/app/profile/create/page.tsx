'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { authService, Avatar } from '@/services/authService'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Wallet, Zap, User, ArrowLeft, Sparkles, Shield, Trophy } from 'lucide-react'

export default function CreateProfilePage() {
  const router = useRouter()
  const { address, isConnected, isConnecting, connectWallet } = useWallet()

  const [username, setUsername] = useState('')
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null)
  const [avatars, setAvatars] = useState<Avatar[]>([])
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load avatars on mount
  useEffect(() => {
    loadAvatars()
  }, [])

  const loadAvatars = async () => {
    try {
      const avatarList = await authService.getAvatars()
      setAvatars(avatarList)
    } catch (err: any) {
      console.error('Failed to load avatars:', err)
      setError('Failed to load avatars')
    } finally {
      setIsLoadingAvatars(false)
    }
  }

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    if (!selectedAvatarId) {
      setError('Please select an avatar')
      return
    }

    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const user = await authService.register(
        address!,
        username.trim(),
        selectedAvatarId,
        false // No signature for testing
      )

      // Store user in localStorage
      localStorage.setItem('monad_trivia_user', JSON.stringify(user))

      // Redirect to home
      router.push('/')
    } catch (err: any) {
      console.error('Profile creation failed:', err)
      setError(err.message || 'Failed to create profile')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-background via-background to-primary/5 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary mb-6 shadow-lg shadow-primary/20 animate-pulse">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Create Your Profile
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the ultimate trivia battle royale. Set up your profile and compete with players worldwide on the Monad blockchain.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center font-medium">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-card border border-border rounded-xl shadow-xl p-8 md:p-10 space-y-8 backdrop-blur-sm">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-sm font-medium">Profile</span>
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm font-medium">Avatar</span>
              </div>
              <div className="w-12 h-0.5 bg-border"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-sm font-medium">Wallet</span>
              </div>
            </div>

            {/* Step 1: Username */}
            <div>
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Choose Your Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base"
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Choose a unique username that represents you in the arena
              </p>
            </div>

            {/* Step 2: Avatar Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Select Your Avatar
              </label>
              {isLoadingAvatars ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Loading avatars...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-lg ${
                        selectedAvatarId === avatar.id
                          ? 'border-primary ring-4 ring-primary/30 shadow-lg shadow-primary/50'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {avatar.image_url ? (
                        <img
                          src={avatar.image_url}
                          alt={avatar.name || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {selectedAvatarId === avatar.id && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                            <svg
                              className="w-6 h-6 text-primary-foreground"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {selectedAvatarId && (
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Selected: <span className="font-medium text-foreground">{avatars.find(a => a.id === selectedAvatarId)?.name}</span>
                </p>
              )}
            </div>

            {/* Step 3: Connect Wallet */}
            <div>
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Connect Your Wallet
              </label>
              {isConnected ? (
                <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 shadow-inner">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Wallet className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Wallet Connected</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {address?.slice(0, 8)}...{address?.slice(-6)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Secure connection via MetaMask - Your profile will be stored on-chain
              </p>
            </div>

            {/* Create Profile Button */}
            <Button
              onClick={handleCreateProfile}
              disabled={!username.trim() || !selectedAvatarId || !isConnected || isCreating}
              className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 shadow-2xl hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed py-6 text-base font-semibold"
              size="lg"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Your Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Profile & Start Playing
                </>
              )}
            </Button>
          </div>

          {/* Info Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure & On-Chain</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is stored securely on the Monad blockchain
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Experience real-time gameplay powered by Monad's speed
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Compete & Earn</h3>
              <p className="text-sm text-muted-foreground">
                Climb the leaderboard and earn rewards for your skills
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
