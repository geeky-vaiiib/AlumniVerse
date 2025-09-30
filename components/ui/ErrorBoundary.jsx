"use client"

import React from 'react'
import { Card, CardContent } from "./card"
import { Button } from "./button"
import { AlertTriangle, RefreshCw } from "lucide-react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <Card className="bg-[#2D2D2D] border-[#3D3D3D] border-red-500/20">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Something went wrong
                </h3>
                <p className="text-gray-400 max-w-md">
                  {this.props.fallbackMessage || 
                   "We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists."}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-4 bg-[#1A1A1A] rounded-lg text-left w-full max-w-2xl">
                  <summary className="text-red-400 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex space-x-3">
                <Button 
                  onClick={this.handleRetry}
                  className="bg-[#4A90E2] hover:bg-[#4A90E2]/80 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-[#4D4D4D] text-white hover:bg-[#3D3D3D]"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier usage
export function withErrorBoundary(Component, fallbackMessage) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallbackMessage={fallbackMessage}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary
