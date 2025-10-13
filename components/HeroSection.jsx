import { Button } from "./ui/button"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-2/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              <span className="gradient-text">Connect, Engage,</span>
              <br />
              <span className="text-foreground">and Thrive Together</span>
            </h1>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="mt-6 text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto text-pretty">
              Join the most comprehensive alumni networking platform designed to foster meaningful connections, career
              growth, and lifelong relationships within your professional community.
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="hover-glow text-lg px-8 py-4">
                <a href="/auth">Join the Network</a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-foreground-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm"></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm"></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse" />
                <span className="text-sm"></span>
              </div>
            </div>
          </div>

          {/* Feature preview cards */}
          <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-card/50 backdrop-blur-sm border border-border-subtle rounded-lg p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Smart Networking</h3>
                <p className="text-sm text-foreground-muted">AI-powered matching with relevant alumni</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border-subtle rounded-lg p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Career Growth</h3>
                <p className="text-sm text-foreground-muted">Exclusive job opportunities and referrals</p>
              </div>
              <div className="bg-card/50 backdrop-blur-sm border border-border-subtle rounded-lg p-6 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Gamification</h3>
                <p className="text-sm text-foreground-muted">Participate in Events and Compitations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
