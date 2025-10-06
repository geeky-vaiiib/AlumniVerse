#!/usr/bin/env node
/**
 * Cleanup Script: Remove Temporary Debug Logs
 * 
 * This script removes all [TEMP] debug logs added during the OTP redirect fix
 * Run this before deploying to production
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const filesToClean = [
  'components/providers/AuthProvider.jsx',
  'components/auth/OTPVerification.jsx', 
  'components/auth/AuthFlow.jsx',
  'middleware.js'
]

const tempLogPatterns = [
  /console\.log\(['"`]🔐 \[TEMP\].*?\)/g,
  /console\.log\(['"`]🛡️ \[TEMP\].*?\)/g,
  /console\.warn\(['"`]🔐 \[TEMP\].*?\)/g,
  /console\.error\(['"`]🔐 \[TEMP\].*?\)/g,
  /\/\/ FIXED:.*$/gm,
  /\/\/ \[TEMP\].*$/gm,
]

async function cleanupTempLogs() {
  console.log('🧹 Cleaning up temporary debug logs...\n')
  
  let totalCleaned = 0
  
  for (const filePath of filesToClean) {
    const fullPath = path.join(__dirname, filePath)
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`)
      continue
    }
    
    let content = fs.readFileSync(fullPath, 'utf8')
    let cleanedCount = 0
    
    for (const pattern of tempLogPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        cleanedCount += matches.length
        content = content.replace(pattern, '')
      }
    }
    
    // Clean up empty lines left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n')
    
    if (cleanedCount > 0) {
      fs.writeFileSync(fullPath, content, 'utf8')
      console.log(`✅ ${filePath}: Removed ${cleanedCount} temp log entries`)
      totalCleaned += cleanedCount
    } else {
      console.log(`ℹ️  ${filePath}: No temp logs found`)
    }
  }
  
  console.log(`\n🎉 Cleanup complete! Removed ${totalCleaned} temporary log entries.`)
  
  if (totalCleaned > 0) {
    console.log('\n📝 Next steps:')
    console.log('1. Review the cleaned files to ensure no functionality was broken')
    console.log('2. Test the auth flow to verify it still works')
    console.log('3. Commit the cleanup changes')
    console.log('4. Deploy to production')
    console.log('5. Rotate Supabase keys for security')
  }
}

// Backup function
function createBackup() {
  const backupDir = path.join(__dirname, 'backup-before-cleanup')
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
  
  for (const filePath of filesToClean) {
    const fullPath = path.join(__dirname, filePath)
    if (fs.existsSync(fullPath)) {
      const backupPath = path.join(backupDir, filePath.replace(/\//g, '_'))
      fs.copyFileSync(fullPath, backupPath)
    }
  }
  
  console.log(`💾 Backup created in: ${backupDir}`)
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  
  if (args.includes('--backup')) {
    createBackup()
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node cleanup-temp-logs.js [options]

Options:
  --backup    Create backup before cleanup
  --help, -h  Show this help message

Examples:
  node cleanup-temp-logs.js --backup    # Create backup then cleanup
  node cleanup-temp-logs.js             # Just cleanup (no backup)
`)
  } else {
    cleanupTempLogs().catch(console.error)
  }
}

export { cleanupTempLogs }
