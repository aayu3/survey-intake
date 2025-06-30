import { useState, useEffect } from 'react'
import { surveyTemplateSchema, type SurveyTemplate } from '../types/surveyTemplate'
import PasswordPopup from '../components/PasswordPopup'

export default function TemplateEditor() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPasswordPopup, setShowPasswordPopup] = useState(false)
  const [template, setTemplate] = useState<string>(
    `{
      "title": "Test Template",
      "description": "This is a test template",
      "form": [
        {"type": "text", "title": "Name", "question": "What is your name?"},
        {"type": "multipleChoice", "title": "Favorite Color", "question": "What is your favorite color?", "options": ["Red", "Blue", "Green"]}
      ]
    }`
  )
  const [parsedTemplate, setParsedTemplate] = useState<SurveyTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has admin access
    const adminStatus = localStorage.getItem('survey-admin')
    if (adminStatus === 'true') {
      setIsAdmin(true)
    } else {
      setShowPasswordPopup(true)
    }
  }, [])


  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
    
    try {
      const json = JSON.parse(e.target.value);
      const parsed = surveyTemplateSchema.parse(json);
      setParsedTemplate(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const handlePasswordSuccess = () => {
    setIsAdmin(true)
    setShowPasswordPopup(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('survey-admin')
    setIsAdmin(false)
    setShowPasswordPopup(true)
  }

  const handleSubmit = async () => {
    if (!parsedTemplate) return;
    
    try {
      const response = await fetch("http://localhost:4000/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedTemplate),
      });
      if (!response.ok) {
        throw new Error("Failed to create template");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }

  if (showPasswordPopup) {
    return <PasswordPopup onSuccess={handlePasswordSuccess} />
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Survey Template</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 text-sm underline"
          >
            Logout
          </button>
        </div>
        
        <textarea
          value={template}
          onChange={handleTemplateChange}
          rows={12}
          className="w-full h-64 p-2 border border-gray-300 rounded-md resize-y"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {parsedTemplate && (
          <div className="mt-4">
            <h2 className="text-lg font-bold">Preview</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(parsedTemplate, null, 2)}
            </pre>
            <div className="mt-2 p-4 bg-white rounded-md shadow-sm"></div>
          </div>
        )}
        
        <button 
          onClick={handleSubmit} 
          className="bg-brand hover:bg-brand/90 active:bg-brand/80 text-white font-medium px-8 py-3 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          disabled={!parsedTemplate}
        >
          Create Template
        </button>
      </div>
    </main>
  )
}


