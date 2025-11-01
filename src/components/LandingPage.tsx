'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { Howl } from 'howler';

import {
  Zap,
  Users,
  Trophy,
  Clock,
  Shield,
  Sparkles,
  Target,
  Coins,
  Rocket,
  CheckCircle2
} from 'lucide-react'

let sound; // Declare outside for wider scope

const playSound = () => {
  sound = new Howl({
    src: ['/sound.mp3'],
  });
  sound.play();
};

const stopSound = () => {
  if (sound) {
    sound.stop();
  }
};


export function LandingPage() {
  const router = useRouter()
  const { isConnected, connectWallet } = useWallet()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-background"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powered by Monad Blockchain</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Battle Royale
              </span>
              <br />
              <span className="text-foreground">Trivia at Lightning Speed</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Compete with up to <span className="text-primary font-semibold">100 players</span> in real-time.
              Answer questions in <span className="text-primary font-semibold">10 seconds</span>.
              Wrong answers mean <span className="text-destructive font-semibold">instant elimination</span>.
              Last one standing wins the prize pool.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={() => router.push('/play')}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Play Now
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
                
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"  onClick={playSound}  >
               Play Sound
              </Button>
                 <Button size="lg" variant="outline" className="text-lg px-8 py-6 "  onClick={stopSound}  >
               Stop Sound
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-4xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Players Per Game</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">10s</div>
                <div className="text-sm text-muted-foreground">Per Question</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">500ms</div>
                <div className="text-sm text-muted-foreground">Block Time</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary">Minimal</div>
                <div className="text-sm text-muted-foreground">Platform Fee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Monad Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold">
              Why Build on <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Monad?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Traditional EVMs would take 20+ minutes to process 100 simultaneous answers.
              Monad does it in a single 500ms block through parallel execution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Parallel Execution</h3>
              <p className="text-muted-foreground">
                Process 100+ transactions simultaneously in a single block, making real-time gameplay possible.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">500ms Blocks</h3>
              <p className="text-muted-foreground">
                Lightning-fast finality ensures instant feedback and seamless user experience.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">EVM Compatible</h3>
              <p className="text-muted-foreground">
                Full Ethereum compatibility with 10,000x better performance for complex applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold">
              Game <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of multiplayer trivia gaming
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <Users className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Massive Multiplayer</h3>
              <p className="text-muted-foreground">
                Compete against up to 100 players simultaneously in each game session.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <Target className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instant Elimination</h3>
              <p className="text-muted-foreground">
                One wrong answer and you're out. Only the sharpest minds survive.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <Trophy className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Winner Takes All</h3>
              <p className="text-muted-foreground">
                The last player standing wins the entire prize pool in crypto.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">10-Second Rounds</h3>
              <p className="text-muted-foreground">
                Fast-paced gameplay keeps you on your toes. Think fast or get eliminated.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <Coins className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Crypto Prizes</h3>
              <p className="text-muted-foreground">
                All entry fees go to the prize pool. Winners receive instant payouts.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/20 transition-all">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Provably Fair</h3>
              <p className="text-muted-foreground">
                All game logic runs on-chain. Transparent and verifiable results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-5xl font-bold">
              How It <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, fast, and fair gameplay powered by blockchain technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground text-sm">
                  Connect your MetaMask wallet and switch to the Monad network.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
            </div>

            <div className="relative">
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Join Game</h3>
                <p className="text-muted-foreground text-sm">
                  Pay the entry fee and wait for the game to start. Up to 100 players can join.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
            </div>

            <div className="relative">
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Answer Questions</h3>
                <p className="text-muted-foreground text-sm">
                  Answer trivia questions within 10 seconds. Wrong answer = elimination.
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
            </div>

            <div className="relative">
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-lg font-semibold mb-2">Win Prizes</h3>
                <p className="text-muted-foreground text-sm">
                  Last player standing wins the entire prize pool, paid instantly.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Ready to Test Your Knowledge?</h3>
                <p className="text-muted-foreground">
                  Connect your wallet and join the next game to compete for prizes.
                </p>
              </div>
              {isConnected ? (
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 whitespace-nowrap">
                  <Rocket className="w-5 h-5 mr-2" />
                  Join Next Game
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 whitespace-nowrap"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">
              About <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MonadTrivia</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              MonadTrivia is a real-time multiplayer Battle Royale trivia game built exclusively for the Monad blockchain.
              Our mission is to showcase the incredible capabilities of parallel execution by creating an engaging gaming
              experience that would be impossible on traditional blockchains.
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Real-Time Gaming</h3>
                <p className="text-sm text-muted-foreground">
                  Experience true real-time gameplay on blockchain
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Fully On-Chain</h3>
                <p className="text-sm text-muted-foreground">
                  All game logic and prize distribution on-chain
                </p>
              </div>
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">Community Driven</h3>
                <p className="text-sm text-muted-foreground">
                  Built by the community, for the community
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
