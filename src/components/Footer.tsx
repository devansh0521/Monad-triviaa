'use client'

import { Twitter, Github, MessageCircle, Zap, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                MonadTrivia
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The ultimate Battle Royale trivia game powered by Monad's blazing-fast blockchain. Compete, learn, and earn rewards.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://monad.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-flex items-center gap-1 transition-all"
                >
                  Monad Blockchain
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Whitepaper
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Community</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://twitter.com/monad_xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-primary" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                aria-label="Github"
              >
                <Github className="w-5 h-5 text-primary" />
              </a>
              <a
                href="https://discord.gg/monad"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Join our growing community to stay updated with the latest news and events.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} MonadTrivia. Built with <span className="text-primary">♥</span> on Monad Blockchain.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
