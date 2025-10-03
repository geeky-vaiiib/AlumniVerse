/**
 * URL validation utilities for profile creation
 * Ensures URLs match database CHECK constraints
 */

// URL validation patterns that match the database CHECK constraints
export const URL_PATTERNS = {
  github: /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/?$/,
  linkedin: /^https:\/\/(www\.)?linkedin\.com\/(in|pub)\/.+$/,
  leetcode: /^https:\/\/(www\.)?leetcode\.com\/[A-Za-z0-9_.-]+\/?$/
}

/**
 * Validates and normalizes a URL for database storage
 * @param {string} url - The URL to validate
 * @param {string} type - The type of URL (github, linkedin, leetcode)
 * @returns {string|null} - Returns normalized URL or null if invalid/empty
 */
export function validateAndNormalizeUrl(url, type) {
  if (!url || typeof url !== 'string') {
    return null
  }

  const trimmedUrl = url.trim()
  if (!trimmedUrl) {
    return null
  }

  const pattern = URL_PATTERNS[type]
  if (pattern && pattern.test(trimmedUrl)) {
    return trimmedUrl
  }

  return null
}

/**
 * Validates GitHub URL
 * @param {string} url 
 * @returns {string|null}
 */
export function validateGitHubUrl(url) {
  return validateAndNormalizeUrl(url, 'github')
}

/**
 * Validates LinkedIn URL
 * @param {string} url 
 * @returns {string|null}
 */
export function validateLinkedInUrl(url) {
  return validateAndNormalizeUrl(url, 'linkedin')
}

/**
 * Validates LeetCode URL
 * @param {string} url 
 * @returns {string|null}
 */
export function validateLeetCodeUrl(url) {
  return validateAndNormalizeUrl(url, 'leetcode')
}

/**
 * Validates all social URLs in a profile object
 * @param {Object} profile - Profile object with URL fields
 * @returns {Object} - Profile object with validated URLs (invalid ones set to null)
 */
export function validateProfileUrls(profile) {
  return {
    ...profile,
    github_url: validateGitHubUrl(profile.githubUrl || profile.github_url),
    linkedin_url: validateLinkedInUrl(profile.linkedinUrl || profile.linkedin_url),
    leetcode_url: validateLeetCodeUrl(profile.leetcodeUrl || profile.leetcode_url),
    resume_url: (profile.resumeUrl && profile.resumeUrl.trim()) ? profile.resumeUrl.trim() : null
  }
}

/**
 * Client-side validation messages
 */
export const URL_VALIDATION_MESSAGES = {
  github: 'Please enter a valid GitHub URL (e.g., https://github.com/username)',
  linkedin: 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)',
  leetcode: 'Please enter a valid LeetCode URL (e.g., https://leetcode.com/username)'
}
