import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { AppProvider } from "@/contexts/AppContext"
import { Toaster } from "@/components/ui/toaster"
import DynamicToast from "@/components/ui/DynamicToast"
import ErrorBoundary from "@/components/ui/ErrorBoundary"

export const metadata = {
  title: "AlumniVerse - Professional Networking Platform",
  description: "Connect, engage, and thrive together with your alumni network",
    generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="font-sans antialiased">
      <body className="min-h-screen bg-[#1A1A1A] text-white">
        <AppProvider>
          <AuthProvider>
            <ErrorBoundary fallbackMessage="The application encountered an unexpected error. Please refresh the page.">
              {children}
            </ErrorBoundary>
            <Toaster />
            <DynamicToast />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  )
}
