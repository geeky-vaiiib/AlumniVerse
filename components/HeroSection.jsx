"use client"

import { Button } from "./ui/button"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="orb-gradient orb-purple w-[600px] h-[600px] -top-40 -left-40 animate-float" style={{ animationDelay: '0s' }} />
        <div className="orb-gradient orb-blue w-[500px] h-[500px] top-1/3 -right-40 animate-float" style={{ animationDelay: '2s' }} />
        <div className="orb-gradient orb-pink w-[400px] h-[400px] -bottom-20 left-1/3 animate-float" style={{ animationDelay: '4s' }} />

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-foreground-muted mb-8">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span>Welcome to AlumniVerse</span>
            </span>
          </div>

          {/* Main Heading */}
          <div className="animate-slide-up delay-100">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1]">
              <span className="gradient-text">Connect, Engage,</span>
              <br />
              <span className="text-foreground">and Thrive Together</span>
            </h1>
          </div>

          {/* Subheading */}
          <div className="animate-slide-up delay-200">
            <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
              Join the most comprehensive alumni networking platform designed to foster
              <span className="text-foreground font-medium"> meaningful connections</span>,
              <span className="text-foreground font-medium"> career growth</span>, and
              <span className="text-foreground font-medium"> lifelong relationships</span>.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-300">
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="btn-gradient text-lg px-8 py-6 h-auto rounded-xl font-semibold">
                  Join the Network
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 h-auto rounded-xl font-semibold bg-transparent border-border hover:bg-surface hover:border-foreground-subtle transition-all"
                >
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="animate-slide-up delay-400">
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">5,000+</p>
                  <p className="text-sm text-foreground-muted">Alumni Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-foreground-muted">Job Opportunities</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent-teal/10 flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-foreground">200+</p>
                  <p className="text-sm text-foreground-muted">Events Hosted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="animate-slide-up delay-500">
            <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="glass-card-hover p-8 text-center group cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎓</span>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Smart Networking</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">AI-powered matching connects you with the most relevant alumni in your field</p>
              </div>

              <div className="glass-card-hover p-8 text-center group cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-teal/20 to-accent-green/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">💼</span>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Career Growth</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">Exclusive job opportunities, referrals, and mentorship from industry experts</p>
              </div>

              <div className="glass-card-hover p-8 text-center group cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-pink/20 to-accent-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Gamification</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">Earn badges, participate in events, and climb the leaderboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
