import { Button } from "./ui/button"

export default function CTASection() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-r from-primary/10 via-chart-2/10 to-success/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground">
            Ready to <span className="gradient-text">Connect</span> with Your Alumni Network?
          </h2>

          <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto text-pretty">
            Join thousands of alumni who are already building meaningful connections, advancing their careers, and
            making a lasting impact in their communities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="hover-glow text-lg px-8 py-4 min-w-[200px]">
              <a href="/auth">Join Now - It's Free</a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 min-w-[200px] bg-transparent">
              <a href="#features">Learn More</a>
            </Button>
          </div>

          <div className="pt-8 border-t border-border-subtle">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-foreground-muted">
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span className="text-sm">Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span className="text-sm">Instant access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span className="text-sm">No spam, ever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
