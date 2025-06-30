import { useState } from 'react'

interface PasswordPopupProps {
  onSuccess: () => void
}

const ADMIN_PASSWORD = 'admin123' // Change this to your desired password

export default function PasswordPopup({ onSuccess }: PasswordPopupProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simple delay for UX
    await new Promise(resolve => setTimeout(resolve, 300))

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('survey-admin', 'true')
      onSuccess()
    } else {
      setError('Incorrect password')
      setPassword('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        
        <div className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h3>
            <p className="text-gray-600">Enter password to create surveys</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-brand hover:bg-brand/90 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </span>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            Hint: Password is "admin123"
          </p>
        </div>
      </div>
    </div>
  )
} 