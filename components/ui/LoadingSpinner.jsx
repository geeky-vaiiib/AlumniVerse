export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#4A90E2]/30 border-t-[#4A90E2] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#B0B0B0]">{message}</p>
      </div>
    </div>
  )
}
