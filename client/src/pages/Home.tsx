import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
interface SurveyTemplateResponse {
  id: string
  title: string
  description?: string
  form: any
  version: number
  isActive: boolean
  createdAt: string
  createdBy?: string
}

export default function Home() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<SurveyTemplateResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:4000/templates')
      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }
      const data = await response.json()
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFormQuestionCount = (form: any) => {
    if (Array.isArray(form)) {
      return form.length
    }
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Loading surveys...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchTemplates}
            className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Survey Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and view your surveys</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/survey"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200"
              >
                Try Demo Survey
              </Link>
              <Link
                to="/create"
                className="bg-brand hover:bg-brand/90 text-white font-medium px-6 py-3 rounded-xl shadow-soft hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                Create New Survey
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No surveys yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first survey template</p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/survey"
                className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200"
              >
                Try Demo Survey
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center bg-brand hover:bg-brand/90 text-white font-medium px-6 py-3 rounded-xl shadow-soft hover:shadow-lg transition-all duration-200"
              >
                Create Your First Survey
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All Surveys ({templates.length})
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {template.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        v{template.version}
                      </span>
                    </div>
                    
                    {template.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{getFormQuestionCount(template.form)} questions</span>
                      <span>{formatDate(template.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/survey/${template.id}`)} 
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Take Survey
                      </button>
                      <button className="flex-1 bg-brand hover:bg-brand/90 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
