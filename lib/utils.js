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
