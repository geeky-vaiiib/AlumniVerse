import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { AppProvider } from "@/contexts/AppContext"
import { UserProvider } from "@/contexts/UserContext"
import { Toaster } from "@/components/ui/toaster"
import DynamicToast from "@/components/ui/DynamicToast"
import ErrorBoundary from "@/components/ui/ErrorBoundary"

export const metadata = {
  title: "AlumniVerse - Professional Alumni Networking Platform",
  description: "Connect, engage, and thrive together with your alumni network. Build meaningful connections and advance your career.",
  generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased scroll-smooth">
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-white">
        <AppProvider>
          <AuthProvider>
            <UserProvider>
              <ErrorBoundary fallbackMessage="The application encountered an unexpected error. Please refresh the page.">
                {children}
              </ErrorBoundary>
              <Toaster />
              <DynamicToast />
            </UserProvider>
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  )
}

