#!/usr/bin/env node

/**
 * Test script to reproduce the infinite redirect loop issue
 * This simulates the complete auth flow: OTP verification -> Profile completion -> Dashboard redirect
 */

const { chromium } = require('playwright')

async function testRedirectLoop() {
  console.log('🧪 Testing Authentication Redirect Loop Issue')
  console.log('===============================================')
  
  const browser = await chromium.launch({ 
    headless: false, // Keep browser open to see the behavior
    slowMo: 1000     // Slow down for visibility
  })
  
  const context = await browser.newContext()
  const page = await context.newPage()
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.text().includes('[MIDDLEWARE]') || 
        msg.text().includes('[AUTH_FLOW]') || 
        msg.text().includes('[DEBUG]')) {
      console.log('🖥️  BROWSER:', msg.text())
    }
  })
  
  try {
    console.log('\n📍 Step 1: Navigate to protected route (should redirect to auth)')
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    console.log('   Current URL:', currentUrl)
    
    if (currentUrl.includes('/auth')) {
      console.log('✅ Successfully redirected to auth page')
    } else {
      console.log('❌ Expected redirect to auth page')
      return
    }
    
    console.log('\n📍 Step 2: Set dummy auth cookie to simulate completed OTP verification')
    // This simulates the state after successful OTP verification
    await page.evaluate(() => {
      document.cookie = 'dummy-auth-verified=true; path=/'
    })
    
    console.log('\n📍 Step 3: Navigate to auth page again (simulating post-OTP state)')
    await page.goto('http://localhost:3000/auth?redirectTo=%2Fdashboard')
    await page.waitForTimeout(3000) // Wait for auth logic to process
    
    console.log('\n📍 Step 4: Check for redirect behavior')
    const finalUrl = page.url()
    console.log('   Final URL:', finalUrl)
    
    // Monitor for rapid redirects (sign of infinite loop)
    let redirectCount = 0
    const redirects = []
    
    page.on('response', (response) => {
      if (response.status() >= 300 && response.status() < 400) {
        redirectCount++
        redirects.push({
          from: response.url(),
          to: response.headers()['location'],
          status: response.status()
        })
        console.log(`   🔄 Redirect #${redirectCount}: ${response.url()} -> ${response.headers()['location']}`)
        
        if (redirectCount > 5) {
          console.log('❌ INFINITE REDIRECT LOOP DETECTED!')
          console.log('   Redirects:', redirects)
        }
      }
    })
    
    // Wait and monitor for additional redirects
    console.log('\n📍 Step 5: Monitor for redirect loops (10 second observation)')
    await page.waitForTimeout(10000)
    
    const endUrl = page.url()
    console.log('\n📊 RESULTS:')
    console.log('   Total redirects observed:', redirectCount)
    console.log('   Final URL:', endUrl)
    
    if (redirectCount > 3) {
      console.log('❌ REDIRECT LOOP DETECTED - TOO MANY REDIRECTS')
    } else if (endUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS - User reached dashboard')
    } else if (endUrl.includes('/auth')) {
      console.log('⚠️  STUCK ON AUTH PAGE - Possible redirect loop')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000')
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  console.log('Checking if development server is running...')
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log('❌ Development server not running on http://localhost:3000')
    console.log('   Please run: npm run dev')
    process.exit(1)
  }
  
  console.log('✅ Server is running, starting test...\n')
  await testRedirectLoop()
}

if (require.main === module) {
  main().catch(console.error)
}
