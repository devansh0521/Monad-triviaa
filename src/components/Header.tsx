'use client'

import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/button'
import { Wallet, Zap, User, UserPlus, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Header() {
  const router = useRouter()
  const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useWallet()
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('monad_trivia_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Check if wallet address matches stored user
  useEffect(() => {
    if (isConnected && user) {
      if (user.wallet_address?.toLowerCase() !== address?.toLowerCase()) {
        // Different wallet connected, clear user
        setUser(null)
        localStorage.removeItem('monad_trivia_user')
      }
    }
  }, [isConnected, address, user])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setUser(null)
    localStorage.removeItem('monad_trivia_user')
  }

  const handleCreateProfile = () => {
    router.push('/profile/create')
  }

  return (
    <>
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push('/')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              MonadTrivia
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {user && isConnected && (
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Dashboard
              </button>
            )}
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </a>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user && isConnected ? (
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {user?.avatar?.image_url && (
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 shadow-md">
                    <img
                      src={user.avatar.image_url}
                      alt={user.avatar.name || 'Avatar'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* User Info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-sm font-medium">
                    {user?.username || formatAddress(address!)}
                  </span>
                  {user?.premium && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-accent to-primary text-primary-foreground font-bold">
                      PRO
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleCreateProfile}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                {user && isConnected && (
                  <button
                    onClick={() => {
                      router.push('/dashboard')
                      setMobileMenuOpen(false)
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors text-left"
                  >
                    Dashboard
                  </button>
                )}
                <a
                  href="#features"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a
                  href="#about"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
              </nav>

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-border/40">
                {user && isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      {user?.avatar?.image_url && (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30">
                          <img
                            src={user.avatar.image_url}
                            alt={user.avatar.name || 'Avatar'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {user?.username || formatAddress(address!)}
                          </span>
                          {user?.premium && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gradient-to-r from-accent to-primary text-primary-foreground font-bold">
                              PRO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs text-muted-foreground">Connected</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDisconnect()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      handleCreateProfile()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
