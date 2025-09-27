export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold gradient-text">AlumniVerse</h3>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Connecting alumni, fostering growth, and building lasting professional relationships.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-foreground-muted hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-foreground-muted hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/auth" className="text-foreground-muted hover:text-foreground transition-colors">
                  Sign Up
                </a>
              </li>
              <li>
                <a href="/auth" className="text-foreground-muted hover:text-foreground transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Mobile App
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-foreground font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@alumniconnect.com"
                  className="text-foreground-muted hover:text-foreground transition-colors"
                >
                  support@alumniconnect.com
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Feedback
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Partnership
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground-muted hover:text-foreground transition-colors">
                  Press Kit
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-foreground-muted text-sm">© {currentYear} AlumniVerse. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span className="text-foreground-muted text-sm">Made with</span>
              <span className="text-red-500">❤️</span>
              <span className="text-foreground-muted text-sm">for alumni everywhere</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
