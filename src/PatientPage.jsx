import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePatients } from './context/PatientContext'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are Dr. Claudeis, a friendly AI intake assistant at a Canadian healthcare clinic. You gather patient info BEFORE the doctor sees them. RULES: Never diagnose. Never suggest conditions. If asked "what do I have?" say "Your doctor will assess that." If emergency symptoms (chest pain, breathing difficulty, stroke signs), say "Please alert staff or call 911 immediately." Ask ONE question at a time. Be warm. Keep to 5-8 exchanges. FLOW: 1) Greet by name, confirm reason. 2) Ask to describe concern. 3) Ask when it started, getting better/worse/same. 4) Severity 1-10. 5) Tried anything? 6) Medical history/medications? 7) Anything else for doctor? 8) Thank them and let them know the doctor will review their information shortly. After thanking the patient in your final message, include the structured summary as a JSON object on its own line at the very end. Output ONLY raw JSON with no markdown fences, no backticks, no extra text after the opening brace: {"patient_name":"...","chief_complaint":"...","symptom_description":"...","onset":"...","progression":"...","severity":"X/10","self_treatment":"...","medical_history":"...","medications":"...","additional_notes":"...","suggested_doctor_questions":["...","...","..."],"flags":["..."]}`

const REASONS = [
  'General checkup',
  'Pain or discomfort',
  'Follow-up visit',
  'New symptoms',
  'Prescription renewal',
  'Mental health concern',
  'Other',
]

// SVG Icons
function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function SparkleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="#D97706">
        <rect x="3" y="0" width="6" height="1" />
        <rect x="2" y="1" width="8" height="2" />
        <rect x="0" y="3" width="12" height="2" />
        <rect x="2" y="5" width="8" height="2" />
        <rect x="2" y="7" width="2" height="3" />
        <rect x="5" y="7" width="2" height="3" />
        <rect x="8" y="7" width="2" height="3" />
      </g>
      <rect x="3" y="2" width="1.5" height="1.5" fill="#1A1A2E" />
      <rect x="7.5" y="2" width="1.5" height="1.5" fill="#1A1A2E" />
      <path d="M 1.5 1.5 Q 6 -0.5 10.5 1.5" stroke="#2D2D3A" strokeWidth="0.6" fill="none" />
      <circle cx="6" cy="1" r="1.4" fill="#F5F0E8" stroke="#2D2D3A" strokeWidth="0.3" />
      <circle cx="6" cy="1" r="0.5" fill="#1A1A2E" />
      <path d="M 1.5 5.5 C 1.5 9 10.5 9 10.5 5.5" stroke="#2D2D3A" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M 6 7.5 v 1.5" stroke="#2D2D3A" strokeWidth="0.8" />
      <circle cx="6" cy="9" r="1" fill="#F5F0E8" stroke="#2D2D3A" strokeWidth="0.4" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

// ============================================================
// LOGIN FORM
// ============================================================
function LoginForm({ onSubmit, onBack }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [reason, setReason] = useState('')

  const valid = firstName.trim() && lastName.trim() && dob && reason

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid #E8E0D4' }}>
        <button
          onClick={onBack}
          className="p-2 rounded-lg cursor-pointer hover:bg-black/5 transition-colors"
          style={{ color: '#2D2D3A' }}
        >
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2">
          <SparkleIcon size={18} />
          <span style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }} className="text-lg font-medium">
            Patient Intake
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="w-full max-w-md"
        >
          <h1
            style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
            className="text-3xl md:text-4xl mb-2"
          >
            Before we begin
          </h1>
          <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-sm mb-8">
            A few details so Dr. Claudeis can greet you properly.
          </p>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={{ fontFamily: '"Inter", sans-serif', color: '#2D2D3A' }} className="block text-xs font-medium mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    background: '#FFFCF7',
                    border: '1px solid #E8E0D4',
                    color: '#2D2D3A',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#D97706')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E0D4')}
                  placeholder="Jane"
                />
              </div>
              <div>
                <label style={{ fontFamily: '"Inter", sans-serif', color: '#2D2D3A' }} className="block text-xs font-medium mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    background: '#FFFCF7',
                    border: '1px solid #E8E0D4',
                    color: '#2D2D3A',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#D97706')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8E0D4')}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label style={{ fontFamily: '"Inter", sans-serif', color: '#2D2D3A' }} className="block text-xs font-medium mb-1.5">
                Date of birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  background: '#FFFCF7',
                  border: '1px solid #E8E0D4',
                  color: '#2D2D3A',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#D97706')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E0D4')}
              />
            </div>

            <div>
              <label style={{ fontFamily: '"Inter", sans-serif', color: '#2D2D3A' }} className="block text-xs font-medium mb-1.5">
                Reason for visit
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all cursor-pointer appearance-none"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  background: '#FFFCF7',
                  border: '1px solid #E8E0D4',
                  color: reason ? '#2D2D3A' : '#8B8B9E',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#D97706')}
                onBlur={(e) => (e.target.style.borderColor = '#E8E0D4')}
              >
                <option value="" disabled>Select a reason...</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => valid && onSubmit({ firstName, lastName, dob, reason })}
              disabled={!valid}
              className="w-full py-3 px-8 text-white font-medium text-sm rounded-3xl cursor-pointer transition-all duration-200"
              style={{
                fontFamily: '"Inter", sans-serif',
                background: valid ? '#D97706' : '#E8E0D4',
                color: valid ? '#fff' : '#8B8B9E',
                boxShadow: valid ? '0 4px 16px rgba(217,119,6,0.25)' : 'none',
              }}
            >
              Begin intake
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================
// CHAT INTERFACE
// ============================================================
function ChatInterface({ patientInfo, onComplete, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Send initial message on mount
  useEffect(() => {
    const initMsg = `Patient: ${patientInfo.firstName} ${patientInfo.lastName}\nDOB: ${patientInfo.dob}\nReason: ${patientInfo.reason}\n\nBegin the intake conversation.`
    sendToAI([{ role: 'user', content: initMsg }])
  }, [])

  async function sendToAI(conversationHistory) {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: conversationHistory,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const aiText = data.content?.[0]?.text || ''

      // Try to extract a JSON summary from anywhere in the response.
      // The AI may wrap it in text like "Thank you! ..." followed by JSON,
      // or put it in markdown fences, etc.
      const jsonMatch = aiText.match(/\{[\s\S]*"patient_name"[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const summary = JSON.parse(jsonMatch[0])
          // Show the conversational part (before the JSON) as a final message
          const preJson = aiText.slice(0, aiText.indexOf(jsonMatch[0])).trim()
          // Strip markdown fences that might precede the JSON
          const cleaned = preJson.replace(/```json?\s*$/i, '').trim()
          if (cleaned) {
            setMessages((prev) => [...prev, { role: 'assistant', content: cleaned }])
          }
          // Small delay so the user sees the thank-you message before transition
          await new Promise((r) => setTimeout(r, cleaned ? 1200 : 0))
          onComplete(summary)
          return
        } catch {
          // Couldn't parse — fall through to show as normal message
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: aiText }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')

    // Build conversation history: include the initial hidden message
    const initMsg = `Patient: ${patientInfo.firstName} ${patientInfo.lastName}\nDOB: ${patientInfo.dob}\nReason: ${patientInfo.reason}\n\nBegin the intake conversation.`
    const fullHistory = [{ role: 'user', content: initMsg }, ...newMessages]
    await sendToAI(fullHistory)
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid #E8E0D4', background: '#FFFCF7' }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-lg cursor-pointer hover:bg-black/5 transition-colors"
          style={{ color: '#2D2D3A' }}
        >
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#D97706' }}
          >
            <SparkleIcon size={16} />
          </div>
          <div>
            <p style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }} className="text-sm font-medium leading-tight">
              Dr. Claudeis
            </p>
            <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-xs">
              AI Intake Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  ...(msg.role === 'user'
                    ? {
                        background: '#D97706',
                        color: '#fff',
                        borderBottomRightRadius: '6px',
                      }
                    : {
                        background: '#FFFCF7',
                        color: '#2D2D3A',
                        border: '1px solid #E8E0D4',
                        borderBottomLeftRadius: '6px',
                      }),
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
              style={{ background: '#FFFCF7', border: '1px solid #E8E0D4', borderBottomLeftRadius: '6px' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D97706', animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D97706', animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D97706', animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mx-auto max-w-sm text-center px-4 py-3 rounded-xl text-sm"
            style={{ background: '#FEF2F2', color: '#EF4444', fontFamily: '"Inter", sans-serif' }}
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="block mx-auto mt-2 text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid #E8E0D4', background: '#FFFCF7' }}
      >
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              fontFamily: '"Inter", sans-serif',
              background: '#F5F0E8',
              border: '1px solid #E8E0D4',
              color: '#2D2D3A',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#D97706')}
            onBlur={(e) => (e.target.style.borderColor = '#E8E0D4')}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0"
            style={{
              background: input.trim() && !loading ? '#D97706' : '#E8E0D4',
              color: input.trim() && !loading ? '#fff' : '#8B8B9E',
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPLETION SCREEN
// ============================================================
function CompletionScreen({ summary, onBack }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F5F0E8' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle />
        </div>
        <h1
          style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
          className="text-3xl md:text-4xl mb-3"
        >
          Intake Complete
        </h1>
        <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-sm mb-2">
          Thank you, {summary.patient_name}.
        </p>
        <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-sm mb-8">
          Your summary has been prepared for the doctor. Please wait to be called in.
        </p>

        <div
          className="text-left rounded-2xl p-5 mb-8"
          style={{ background: '#FFFCF7', border: '1px solid #E8E0D4', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-xs mb-3 uppercase tracking-wider font-medium">
            Summary preview
          </p>
          <p style={{ fontFamily: '"Inter", sans-serif', color: '#2D2D3A' }} className="text-sm font-medium mb-1">
            {summary.chief_complaint}
          </p>
          <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-xs">
            Severity: <span style={{ fontFamily: '"Space Mono", monospace', color: '#2D2D3A' }}>{summary.severity}</span>
          </p>
        </div>

        <button
          onClick={onBack}
          className="py-3 px-8 text-sm font-medium rounded-3xl cursor-pointer transition-all duration-200"
          style={{
            fontFamily: '"Inter", sans-serif',
            color: '#D97706',
            background: 'transparent',
            border: '1px solid #D97706',
          }}
        >
          Back to home
        </button>
      </motion.div>
    </div>
  )
}

// ============================================================
// MAIN PATIENT PAGE
// ============================================================
export default function PatientPage() {
  const navigate = useNavigate()
  const { addSummary } = usePatients()
  const [step, setStep] = useState('login') // login | chat | complete
  const [patientInfo, setPatientInfo] = useState(null)
  const [summary, setSummary] = useState(null)

  function handleLogin(info) {
    setPatientInfo(info)
    setStep('chat')
  }

  function handleComplete(summaryData) {
    setSummary(summaryData)
    addSummary(summaryData)
    setStep('complete')
  }

  if (step === 'login') {
    return <LoginForm onSubmit={handleLogin} onBack={() => navigate('/')} />
  }

  if (step === 'chat') {
    return (
      <ChatInterface
        patientInfo={patientInfo}
        onComplete={handleComplete}
        onBack={() => setStep('login')}
      />
    )
  }

  return (
    <CompletionScreen
      summary={summary}
      onBack={() => navigate('/')}
    />
  )
}
