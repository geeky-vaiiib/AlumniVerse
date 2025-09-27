import "./globals.css"
import { AuthProvider } from "@/components/providers/AuthProvider"

export const metadata = {
  title: "Alumni Connect - Professional Networking Platform",
  description: "Connect, engage, and thrive together with your alumni network",
    generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="font-sans antialiased">
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
