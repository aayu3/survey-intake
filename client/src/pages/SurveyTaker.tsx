import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Question {
  type: 'text' | 'multipleChoice'
  title: string
  question: string
  options?: string[]
}

interface SurveyTemplate {
  id: string
  title: string
  description?: string
  form: Question[]
}

interface Answer {
  question: string
  answer: string
}

export default function SurveyTaker() {
  const { templateId } = useParams<{ templateId: string }>()
  const navigate = useNavigate()
  
  const [survey, setSurvey] = useState<SurveyTemplate | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)


  const fetchSurvey = async () => {
    if (templateId) {
      await fetch(`http://localhost:4000/template/${templateId}`)
        .then(res => res.json())
        .then(data => setSurvey(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))
        }
    }

  useEffect(() => {
    fetchSurvey()
  }, [templateId])

  useEffect(() => {
    // Load the current answer when question changes
    if (survey && answers.length > 0) {
      const currentQ = survey.form[currentQuestionIndex]
      const existingAnswer = answers.find(a => a.question === currentQ.question)
      setCurrentAnswer(existingAnswer?.answer || '')
    }
  }, [currentQuestionIndex, survey, answers])

  useEffect(() => {
    const saved = localStorage.getItem(`survey-answers-${templateId}`)
    if (saved) {
      try {
        const parsedAnswers = JSON.parse(saved)
        setAnswers(parsedAnswers)
      } catch (err) {
        console.error('Failed to parse saved answers:', err)
      }
    }
  }, [templateId]);

  const saveAnswer = () => {
    if (!survey || !currentAnswer.trim()) return

    const currentQuestion = survey.form[currentQuestionIndex]
    const newAnswers = [...answers]
    const existingIndex = newAnswers.findIndex(a => a.question === currentQuestion.question)
    
    const answerObj: Answer = {
      question: currentQuestion.question,
      answer: currentAnswer
    }

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = answerObj
    } else {
      newAnswers.push(answerObj)
    }

    setAnswers(newAnswers)
    localStorage.setItem(`survey-answers-${survey.id}`, JSON.stringify(newAnswers))
  }

  const handleNext = () => {
    saveAnswer()
    if (survey && currentQuestionIndex < survey.form.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer('')
    }
  }

  const handlePrevious = () => {
    saveAnswer()
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentAnswer('')
    }
  }

  const handleSubmit = () => {
    saveAnswer()
    setIsSubmitted(true)
    // Optionally, you could also send the answers to your server here
  }

  const handleRestart = () => {
    if (survey) {
      localStorage.removeItem(`survey-answers-${survey.id}`)
      setAnswers([])
      setCurrentQuestionIndex(0)
      setCurrentAnswer('')
      setIsSubmitted(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
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
            onClick={() => navigate('/')}
            className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!survey) return null

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-soft text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your survey responses have been saved.</p>
          
          <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
            <h3 className="font-semibold mb-2">Your Answers:</h3>
            {answers.map((answer, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm text-gray-600">{answer.question}</p>
                <p className="font-medium">{answer.answer}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleRestart}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Take Again
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = survey.form[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / survey.form.length) * 100
  const isLastQuestion = currentQuestionIndex === survey.form.length - 1

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
        <button onClick={() => navigate('/')} className="bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-lg transition-colors">
          Back to Home
        </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
            {survey.description && (
              <p className="text-gray-600">{survey.description}</p>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {survey.form.length}
          </div>
        </div>
        
      </header>

      {/* Question Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-soft p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === 'text' && (
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                placeholder="Enter your answer..."
                autoFocus
              />
            )}

            {currentQuestion.type === 'multipleChoice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={currentAnswer === option}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="mr-3 text-brand focus:ring-brand"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center px-6 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!currentAnswer.trim()}
                className="flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Survey
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!currentAnswer.trim()}
                className="flex items-center px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Progress Bar */}
      <div className="bg-white border-t p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-brand h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 