'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Coins,
  Target,
  Calendar,
  ArrowLeft,
  Loader2,
  Crown,
  Flame,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Award,
  Play,
  ExternalLink,
} from 'lucide-react'

interface GameHistory {
  id: number
  room_code: string
  mode: string
  status: string
  entry_fee: number
  pool_amount: number
  created_at: string
  finished_at: string
  is_host: boolean
  is_winner: boolean
  payment: any
}

interface UserStats {
  total_games: number
  total_wins: number
  total_losses: number
  win_rate: string
  total_staked: string
  total_earnings: string
  profit_loss: string
  current_streak: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentGames, setRecentGames] = useState<GameHistory[]>([])
  const [activeGames, setActiveGames] = useState<GameHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('monad_trivia_user')
    if (!storedUser) {
      router.push('/profile/create')
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)
    loadUserStats(userData.id)
  }, [router])

  const loadUserStats = async (userId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/stats?user_id=${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load stats')
      }

      setStats(data.stats)
      setRecentGames(data.recent_games)
      setActiveGames(data.active_games)
    } catch (err: any) {
      console.error('Load stats error:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/play')}>Back to Play</Button>
        </div>
      </div>
    )
  }

  const profitLossNum = stats ? parseFloat(stats.profit_loss) : 0
  const isProfit = profitLossNum > 0

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl pt-24 pb-20">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/play')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                      Track your performance and earnings
                    </p>
                  </div>
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                  {user.avatar?.image_url && (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 shadow-md">
                      <img
                        src={user.avatar.image_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">
                        {user.username || 'Player'}
                      </p>
                      {user.premium && (
                        <Award className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user.wallet_address?.slice(0, 6)}...
                      {user.wallet_address?.slice(-4)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Games */}
            <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-blue-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground tracking-wider">GAMES</span>
              </div>
              <p className="text-4xl font-bold mb-1">{stats.total_games}</p>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-500 font-medium">{stats.total_wins}W</span> / <span className="text-red-400 font-medium">{stats.total_losses}L</span>
              </p>
            </div>

            {/* Win Rate */}
            <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-yellow-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground tracking-wider">WIN RATE</span>
              </div>
              <p className="text-4xl font-bold mb-1">{stats.win_rate}%</p>
              <p className="text-sm text-muted-foreground">
                {stats.total_wins} {stats.total_wins === 1 ? 'victory' : 'victories'}
              </p>
            </div>

            {/* Total Staked */}
            <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-orange-500/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Coins className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground tracking-wider">STAKED</span>
              </div>
              <p className="text-3xl font-bold mb-1">{stats.total_staked}</p>
              <p className="text-sm text-muted-foreground">MON invested</p>
            </div>

            {/* Profit/Loss */}
            <div className={`group bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${
              isProfit ? 'hover:border-green-500/30' : 'hover:border-red-500/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                  isProfit ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {isProfit ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <span className="text-xs font-semibold text-muted-foreground tracking-wider">NET P&L</span>
              </div>
              <p
                className={`text-3xl font-bold mb-1 ${
                  isProfit ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isProfit ? '+' : ''}
                {stats.profit_loss}
              </p>
              <p className="text-sm text-muted-foreground">
                MON {isProfit ? 'profit' : 'loss'}
              </p>
            </div>
          </div>
        )}

        {/* Earnings Summary */}
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Financial Overview</h2>
                <p className="text-sm text-muted-foreground">
                  Lifetime rewards and investment tracking
                </p>
              </div>
            </div>
            {stats && stats.current_streak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-500">{stats.current_streak} Win Streak</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background/70 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-orange-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Staked</p>
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-500 mb-1">
                {stats?.total_staked || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">MON invested</p>
            </div>
            <div className="bg-background/70 backdrop-blur-sm rounded-xl p-5 border border-border/50 hover:border-green-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-500 mb-1">
                {stats?.total_earnings || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">MON won</p>
            </div>
            <div className={`bg-background/70 backdrop-blur-sm rounded-xl p-5 border transition-colors ${
              isProfit ? 'border-green-500/30 hover:border-green-500/50' : 'border-red-500/30 hover:border-red-500/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Result</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isProfit ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <p
                className={`text-3xl font-bold mb-1 ${
                  isProfit ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isProfit ? '+' : ''}
                {stats?.profit_loss || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">MON {isProfit ? 'profit' : 'loss'}</p>
            </div>
          </div>
        </div>

        {/* Active Games */}
        {activeGames.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                Active Games
              </h2>
              <span className="text-sm text-muted-foreground bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                {activeGames.length} {activeGames.length === 1 ? 'game' : 'games'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGames.map((game) => (
                <div
                  key={game.id}
                  className="group bg-card border-2 border-orange-500/20 rounded-xl p-5 hover:border-orange-500/50 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/play/lobby/${game.room_code}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-lg">{game.room_code}</p>
                          {game.is_host && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                              <Crown className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs font-medium text-yellow-500">Host</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {game.mode?.replace('_', ' ') || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      game.status === 'active' ? 'bg-green-500/10 text-green-500' :
                      game.status === 'funded' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {game.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Entry Fee</p>
                      <p className="text-lg font-bold text-orange-500">
                        {game.entry_fee ? `${Number(game.entry_fee).toFixed(3)} MON` : 'Free'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/play/lobby/${game.room_code}`)
                      }}
                    >
                      Rejoin
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Games History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Game History
            </h2>
            {recentGames.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Last {recentGames.length} {recentGames.length === 1 ? 'game' : 'games'}
              </span>
            )}
          </div>

          {recentGames.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">
                No games played yet
              </p>
              <Button onClick={() => router.push('/play')}>
                Play Your First Game
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGames.map((game) => {
                const isFinished = game.status === 'finished'
                const entryFee = game.entry_fee
                  ? Number(game.entry_fee)
                  : 0
                const poolAmount = game.pool_amount
                  ? Number(game.pool_amount)
                  : 0

                return (
                  <div
                    key={game.id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            game.is_winner
                              ? 'bg-green-500/10'
                              : isFinished
                              ? 'bg-red-500/10'
                              : 'bg-blue-500/10'
                          }`}
                        >
                          {game.is_winner ? (
                            <Trophy className="w-5 h-5 text-green-500" />
                          ) : isFinished ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{game.room_code}</p>
                            {game.is_host && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                            {game.is_winner && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 font-medium">
                                WON
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {game.mode?.replace('_', ' ') || 'Unknown'} •{' '}
                            {new Date(game.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isFinished ? (
                          <>
                            <p
                              className={`text-lg font-bold ${
                                game.is_winner
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {game.is_winner
                                ? `+${poolAmount.toFixed(3)}`
                                : `-${entryFee.toFixed(3)}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              MON
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-blue-500">
                              {game.status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              In Progress
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {/* <div className="mt-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => router.push('/play')}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-16 text-lg"
              size="lg"
            >
              <Play className="w-6 h-6 mr-2" />
              Play New Game
            </Button>
            
          </div>
        </div> */}
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MonadTrivia
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Compete in real-time trivia battles on Monad blockchain.
              </p>
              {stats && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>🎮 {stats.total_games} Games Played</p>
                  <p>🏆 {stats.total_wins} Victories</p>
                  <p>💰 {stats.total_earnings} MON Earned</p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => router.push('/play')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Play Game
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <a
                    href="https://docs.monad.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Stats Summary */}
            <div>
              <h3 className="font-semibold mb-3">Your Performance</h3>
              {stats && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Win Rate</span>
                    <span className="font-semibold text-yellow-500">{stats.win_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Net P&L</span>
                    <span className={`font-semibold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                      {isProfit ? '+' : ''}{stats.profit_loss} MON
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Staked</span>
                    <span className="font-semibold">{stats.total_staked} MON</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2025 MonadTrivia. Built on Monad Blockchain.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a
                href="https://monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Monad Network
              </a>
              <span>•</span>
              <a
                href="https://explorer.testnet.monad.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Block Explorer
              </a>
              <span>•</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-primary transition-colors"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
