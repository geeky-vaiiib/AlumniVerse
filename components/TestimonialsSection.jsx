import { Card, CardContent } from "./ui/card"

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    batch: "Class of 2020",
    content:
      "AlumniVerse helped me land my dream job at Google through a referral from a senior. The platform made networking so much easier!",
    avatar: "PS",
    rating: 5,
  },
  {
    name: "Rahul Kumar",
    role: "Product Manager at Microsoft",
    batch: "Class of 2018",
    content:
      "The gamification features keep me engaged, and I've made some incredible professional connections. Highly recommend to all alumni!",
    avatar: "RK",
    rating: 5,
  },
  {
    name: "Anita Patel",
    role: "Startup Founder",
    batch: "Class of 2019",
    content:
      "Found my co-founder and first employees through AlumniVerse. The platform is a game-changer for entrepreneurial alumni.",
    avatar: "AP",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Our <span className="gradient-text">Alumni Say</span>
          </h2>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto text-pretty">
            Don't just take our word for it. Here's what our community members have to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:scale-105 transition-all duration-300 bg-card/50 backdrop-blur-sm animate-slide-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-warning text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-foreground-muted mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-chart-2 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-foreground-muted">{testimonial.role}</p>
                    <p className="text-xs text-primary">{testimonial.batch}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-foreground-muted">
            <span className="text-2xl">⭐</span>
            <span className="text-lg font-semibold">4.9/5</span>
            <span>average rating from 500+ alumni</span>
          </div>
        </div>
      </div>
    </section>
  )
}
