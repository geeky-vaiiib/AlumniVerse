export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateAvatar(name) {
  const colors = ["#4a90e2", "#6366f1", "#f59e0b", "#52c41a", "#ff4d4f"]
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const colorIndex = name.length % colors.length
  const backgroundColor = colors[colorIndex]

  return {
    initials,
    backgroundColor,
    textColor: "#ffffff",
  }
}

/**
 * Get initials from a full name
 * @param {string} name - Full name
 * @returns {string} - Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name) {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

/**
 * Format timestamp to relative time
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - Formatted relative time (e.g., "2 hours ago")
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffMinutes = Math.ceil(diffTime / (1000 * 60))
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffMinutes < 60) {
    if (diffMinutes === 1) return '1 minute ago'
    return `${diffMinutes} minutes ago`
  }

  if (diffHours < 24) {
    if (diffHours === 1) return '1 hour ago'
    return `${diffHours} hours ago`
  }

  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString()
}

/**
 * Get time ago string for job postings
 * @param {string} dateString - Date string
 * @returns {string} - Time ago string (e.g., "3 days ago")
 */
export function getTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

/**
 * Generate a random ID
 * @returns {string} - Random ID string
 */
export function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

/**
 * Extract hashtags from text
 * @param {string} text - Text to extract hashtags from
 * @returns {Array} - Array of hashtags without # symbol
 */
export function extractHashtags(text) {
  if (!text) return []
  const hashtags = text.match(/#\w+/g) || []
  return hashtags.map(tag => tag.substring(1))
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Safe array mapping to prevent runtime errors
 * @param {any} array - Potential array to map
 * @param {Function} callback - Mapping function
 * @returns {Array} - Mapped array or empty array if input is not an array
 */
export function safeMap(array, callback) {
  if (!Array.isArray(array)) {
    console.warn('safeMap: Expected array but received:', typeof array, array)
    return []
  }
  return array.map(callback)
}

/**
 * Safe array filtering to prevent runtime errors
 * @param {any} array - Potential array to filter
 * @param {Function} callback - Filter function
 * @returns {Array} - Filtered array or empty array if input is not an array
 */
export function safeFilter(array, callback) {
  if (!Array.isArray(array)) {
    console.warn('safeFilter: Expected array but received:', typeof array, array)
    return []
  }
  return array.filter(callback)
}

/**
 * Ensure value is an array
 * @param {any} value - Value to check
 * @param {Array} fallback - Fallback array if value is not an array
 * @returns {Array} - Array value or fallback
 */
export function ensureArray(value, fallback = []) {
  if (Array.isArray(value)) {
    return value
  }
  console.warn('ensureArray: Expected array but received:', typeof value, value)
  return fallback
}

/**
 * Safe array length check
 * @param {any} array - Potential array
 * @returns {number} - Length of array or 0 if not an array
 */
export function safeLength(array) {
  return Array.isArray(array) ? array.length : 0
}

/**
 * Safe array access with index
 * @param {any} array - Potential array
 * @param {number} index - Index to access
 * @param {any} fallback - Fallback value if access fails
 * @returns {any} - Array item or fallback
 */
export function safeArrayAccess(array, index, fallback = null) {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return fallback
  }
  return array[index]
}
