"use client"

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [mounted, setMounted] = useState(false)
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    console.log('TestPage: Component mounted successfully!')
    setMounted(true)

    const results = []

    // Test if we can access document
    if (typeof document !== 'undefined') {
      console.log('TestPage: Document is available')
      document.title = 'AlumniVerse Test Page - Working!'
      results.push('✅ Document API available')
    } else {
      results.push('❌ Document API not available')
    }

    // Test if we can access window
    if (typeof window !== 'undefined') {
      console.log('TestPage: Window is available')
      console.log('TestPage: Current URL:', window.location.href)
      results.push('✅ Window API available')
      results.push(`✅ Current URL: ${window.location.href}`)
    } else {
      results.push('❌ Window API not available')
    }

    // Test React state
    results.push('✅ React state management working')
    results.push('✅ useEffect hook working')
    results.push('✅ Component rendering successfully')

    setTestResults(results)
  }, [])

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1A1A1A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        Loading test page...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1A1A1A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          🎉 AlumniVerse Frontend is Working!
        </h1>
        <p style={{ color: '#B0B0B0', marginBottom: '1rem' }}>
          This test page confirms the frontend is rendering correctly.
        </p>

        <div style={{
          backgroundColor: '#2D2D2D',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#4A90E2', marginBottom: '0.5rem' }}>Test Results:</h3>
          {testResults.map((result, index) => (
            <div key={index} style={{
              color: result.startsWith('✅') ? '#28a745' : '#dc3545',
              marginBottom: '0.25rem',
              fontSize: '0.9rem'
            }}>
              {result}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
          <a
            href="/auth"
            style={{
              display: 'block',
              backgroundColor: '#4A90E2',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            Go to Auth Page
          </a>
          <a
            href="/login"
            style={{
              display: 'block',
              backgroundColor: '#2D2D2D',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            Go to Login Page
          </a>
          <a
            href="/dashboard"
            style={{
              display: 'block',
              backgroundColor: '#2D2D2D',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s'
            }}
          >
            Go to Dashboard
          </a>
          <button
            onClick={() => {
              console.log('TestPage: Button clicked!')
              alert('Frontend JavaScript is working!')
            }}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Test JavaScript
          </button>
        </div>
      </div>
    </div>
  )
}
