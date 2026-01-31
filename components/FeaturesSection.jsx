"use client"

import { Card, CardContent } from "./ui/card"

const features = [
  {
    title: "Alumni Directory",
    description: "Comprehensive directory of verified alumni with advanced search and filtering capabilities.",
    icon: "👥",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    delay: "0ms"
  },
  {
    title: "Networking Hub",
    description: "Connect with fellow alumni, share experiences, and build meaningful professional relationships.",
    icon: "🤝",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    delay: "100ms"
  },
  {
    title: "Job Board",
    description: "Exclusive job opportunities shared by alumni, with referral system and career advancement resources.",
    icon: "💼",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    delay: "200ms"
  },
  {
    title: "Events & Reunions",
    description: "Stay updated on alumni events, reunions, webinars, and networking meetups in your area.",
    icon: "📅",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    delay: "300ms"
  },
  {
    title: "Gamification",
    description: "Earn badges, build your reputation, and climb the leaderboard through active community participation.",
    icon: "🏆",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    delay: "400ms"
  },
  {
    title: "Admin Dashboard",
    description: "Comprehensive management tools for alumni associations to track engagement and manage the community.",
    icon: "⚙️",
    color: "from-slate-500 to-zinc-500",
    bgColor: "bg-slate-500/10",
    delay: "500ms"
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface/50 to-background" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-medium text-foreground-muted mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Platform Features
            </span>
          </div>

          <h2 className="animate-slide-up delay-100 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Everything You Need to{" "}
            <span className="gradient-text">Stay Connected</span>
          </h2>

          <p className="animate-slide-up delay-200 text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
            Our platform provides all the tools necessary to build and maintain a thriving alumni community with powerful features designed for engagement.
          </p>
        </div>

        {/* Features Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="animate-slide-up group glass-card-hover border-0 overflow-hidden"
              style={{ animationDelay: feature.delay }}
            >
              <CardContent className="p-8">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                <p className="text-foreground-muted leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover accent line */}
                <div className={`mt-6 h-1 w-0 group-hover:w-16 rounded-full bg-gradient-to-r ${feature.color} transition-all duration-300`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="animate-slide-up delay-600 mt-16 text-center">
          <p className="text-foreground-muted mb-4">Ready to explore all features?</p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors group"
          >
            Get started for free
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
