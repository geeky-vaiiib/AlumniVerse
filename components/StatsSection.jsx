"use client"

import { useState, useEffect } from "react"

const stats = [
  { label: "Active Alumni", value: 1247, suffix: "+" },
  { label: "Connections Made", value: 3891, suffix: "+" },
  { label: "Job Referrals", value: 156, suffix: "+" },
  { label: "Events Hosted", value: 89, suffix: "+" },
]

function AnimatedCounter({ end, duration = 2000 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, duration])

  return count
}

export default function StatsSection() {
  return (
    <section className="py-20 sm:py-32 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Growing <span className="gradient-text">Community Impact</span>
          </h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto text-pretty">
            Join thousands of alumni who are already making meaningful connections and advancing their careers.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl hover:scale-105 transition-transform duration-300">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  <AnimatedCounter end={stat.value} />
                  {stat.suffix}
                </div>
                <div className="text-sm sm:text-base text-white/80 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
