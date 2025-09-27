import { Card, CardContent } from "./ui/Card"

const values = [
  {
    title: "Connection",
    description: "Building meaningful relationships that last beyond graduation",
    icon: "🤝",
    color: "from-primary to-chart-2",
  },
  {
    title: "Growth",
    description: "Fostering professional and personal development through collaboration",
    icon: "📈",
    color: "from-chart-2 to-success",
  },
  {
    title: "Impact",
    description: "Creating positive change in our communities and industries",
    icon: "🌟",
    color: "from-success to-warning",
  },
  {
    title: "Excellence",
    description: "Maintaining the highest standards in everything we do",
    icon: "🏆",
    color: "from-warning to-primary",
  },
]

export default function AboutSection() {
  return (
    <section id="about" className="py-20 sm:py-32 bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            About <span className="gradient-text">Alumni Connect</span>
          </h2>
          <p className="text-lg text-foreground-muted max-w-3xl mx-auto text-pretty">
            We're more than just a networking platform. We're a community dedicated to fostering lifelong connections,
            professional growth, and meaningful impact among our alumni network.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Empowering Alumni Success</h3>
            <p className="text-foreground-muted leading-relaxed">
              Since our inception, we've been committed to creating a platform that goes beyond traditional networking.
              Our mission is to provide alumni with the tools, connections, and opportunities they need to thrive in
              their careers and make a lasting impact.
            </p>
            <p className="text-foreground-muted leading-relaxed">
              Through innovative features like our gamified engagement system, comprehensive job board, and dynamic
              event management, we're redefining what it means to stay connected with your alma mater and fellow
              graduates.
            </p>
            <div className="flex items-center space-x-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5+</div>
                <div className="text-sm text-foreground-muted">Years Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-foreground-muted">Alumni Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-foreground-muted">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-2xl blur-3xl"></div>
            <Card className="relative bg-card/50 backdrop-blur-sm border-border-subtle">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Our Mission</h4>
                      <p className="text-sm text-foreground-muted">
                        To create the world's most engaging alumni community
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-chart-2/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👁️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Our Vision</h4>
                      <p className="text-sm text-foreground-muted">
                        A world where every graduate stays connected and thrives
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="group hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                >
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
