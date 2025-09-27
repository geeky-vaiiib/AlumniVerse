import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"

const features = [
  {
    title: "Alumni Directory",
    description:
      "Comprehensive searchable database of alumni with advanced filtering by batch, location, industry, and skills.",
    icon: "👥",
    gradient: "from-primary to-secondary",
  },
  {
    title: "Networking Hub",
    description: "Connect with fellow alumni, share experiences, and build meaningful professional relationships.",
    icon: "🤝",
    gradient: "from-secondary to-accent",
  },
  {
    title: "Job Board",
    description: "Exclusive job opportunities shared by alumni, with referral system and career advancement resources.",
    icon: "💼",
    gradient: "from-accent to-success",
  },
  {
    title: "Events & Reunions",
    description: "Stay updated on alumni events, reunions, webinars, and networking meetups in your area.",
    icon: "📅",
    gradient: "from-success to-primary",
  },
  {
    title: "Gamification",
    description:
      "Earn badges, build your reputation, and climb the leaderboard through active community participation.",
    icon: "🏆",
    gradient: "from-primary to-warning",
  },
  {
    title: "Admin Dashboard",
    description: "Comprehensive management tools for alumni associations to track engagement and manage the community.",
    icon: "⚙️",
    gradient: "from-warning to-secondary",
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to <span className="gradient-text">Stay Connected</span>
          </h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto text-pretty">
            Our platform provides all the tools necessary to build and maintain a thriving alumni community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:scale-105 transition-transform duration-300 animate-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-foreground-muted leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
