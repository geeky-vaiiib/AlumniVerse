import Navbar from "./Navbar"
import HeroSection from "./HeroSection"
import FeaturesSection from "./FeaturesSection"
import AboutSection from "./AboutSection"
import TestimonialsSection from "./TestimonialsSection"
import CTASection from "./CTASection"
import Footer from "./Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}