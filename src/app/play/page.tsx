'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Users, DoorOpen, Gamepad2, ArrowLeft, Shield, Zap, Trophy, Eye } from 'lucide-react'

export default function PlayPage() {
  const router = useRouter()

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
            <div className='flex justify-center gap-4 items-center'>
<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary mb-6 shadow-lg shadow-primary/20 animate-pulse">
              <Gamepad2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Ready to Play?
            </h1> 
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create your own room or join an existing game with friends. Choose your adventure and start the ultimate trivia challenge.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Create Room Card */}
            <div className="bg-card border border-border rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow backdrop-blur-sm">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-8 h-8 text-primary" />
              </div>

              <h2 className="text-2xl font-bold mb-3">Create Room</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Host a new game and invite your friends with a unique room code
              </p>

              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-muted-foreground">Generate unique room code</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-muted-foreground">Customize game settings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-muted-foreground">Control when to start</span>
                </li>
              </ul>

              <Button
                onClick={() => router.push('/play/create')}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Create Room
              </Button>
            </div>

            {/* Join Room Card */}
            <div className="bg-card border border-border rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow backdrop-blur-sm">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6 shadow-lg">
                <DoorOpen className="w-8 h-8 text-accent" />
              </div>

              <h2 className="text-2xl font-bold mb-3">Join Room</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Enter a room code to join an existing game with your friends
              </p>

              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  </div>
                  <span className="text-muted-foreground">Enter 6-digit room code</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  </div>
                  <span className="text-muted-foreground">Join instantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  </div>
                  <span className="text-muted-foreground">Wait for game to start</span>
                </li>
              </ul>

              <Button
                onClick={() => router.push('/play/join')}
                className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Join Room
              </Button>
            </div>

            {/* Spectate Room Card */}
            <div className="bg-card border border-border rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow backdrop-blur-sm">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center mb-6 shadow-lg">
                <Eye className="w-8 h-8 text-purple-500" />
              </div>

              <h2 className="text-2xl font-bold mb-3">Spectate Game</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Watch games and place predictions on winners to earn rewards
              </p>

              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  </div>
                  <span className="text-muted-foreground">Watch live gameplay</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  </div>
                  <span className="text-muted-foreground">Bet on winners after Q5</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  </div>
                  <span className="text-muted-foreground">Win MONAD rewards</span>
                </li>
              </ul>

              <Button
                onClick={() => router.push('/spectate/join')}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                Spectate Game
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Action</h3>
              <p className="text-sm text-muted-foreground">
                Experience instant gameplay with live updates and synchronized rooms
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Powered by Monad blockchain for seamless multiplayer experience
              </p>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Compete Together</h3>
              <p className="text-sm text-muted-foreground">
                Challenge friends and climb the leaderboard to prove your skills
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
