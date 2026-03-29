import { useState, useRef, useEffect, useCallback } from 'react'

/* ───────────────────────── Mock Data ───────────────────────── */

const VISIT_REASONS = [
  'General checkup',
  'Headache / Migraine',
  'Stomach / Digestive issues',
  'Back / Joint pain',
  'Skin concern',
  'Cold / Flu symptoms',
  'Mental health',
  'Follow-up visit',
  'Other',
]

const MOCK_PATIENTS = [
  {
    id: 1,
    firstName: 'Sarah',
    lastName: 'Chen',
    dob: '1990-04-12',
    reason: 'Headache / Migraine',
    completedAt: '10:24 AM',
    severity: 7,
    summary: {
      chiefComplaint:
        'Recurring severe headaches with increasing frequency over the past two weeks, primarily affecting the right temple and behind the right eye.',
      timeline:
        'Started approximately 2 weeks ago. Initially occurring 2–3 times a week, now daily. Episodes last 4–6 hours. Worsening trend noted — patient describes pain as "building in intensity each day."',
      selfTreatment:
        'Ibuprofen 400 mg as needed (2–3 times daily on bad days). Reports mild temporary relief but pain returns within 2 hours. Has tried dark rooms and cold compresses with partial benefit.',
      history:
        'History of episodic migraines since age 16 (previously 1–2/month). Currently on no prescription medication for migraines. No other chronic conditions. NKDA.',
      medications: 'Ibuprofen 400 mg PRN, Multivitamin daily',
      suggestedQuestions: [
        'Any visual disturbances, aura, or neurological symptoms (numbness, weakness, speech issues)?',
        'Any recent head trauma, changes in sleep, or new stressors?',
        'Family history of aneurysms or other vascular conditions?',
      ],
      flags: [
        'Increasing headache frequency and intensity — may warrant neuroimaging to rule out secondary causes.',
        'High NSAID usage — risk of medication-overuse headache.',
      ],
    },
  },
  {
    id: 2,
    firstName: 'James',
    lastName: 'Wilson',
    dob: '1985-09-28',
    reason: 'Back / Joint pain',
    completedAt: '10:41 AM',
    severity: 5,
    summary: {
      chiefComplaint:
        'Acute lower back pain after lifting a heavy box 3 days ago. Pain localized to the lumbar region, no radiation to legs.',
      timeline:
        'Started 3 days ago after lifting a heavy box at home. Pain was initially sharp, now described as a dull ache. Condition is stable — not worsening. Rates pain as 5/10 at rest, 7/10 with bending or twisting.',
      selfTreatment:
        'Applied heat pad 2–3 times daily with moderate relief. Resting as much as possible. Has not taken any pain medication.',
      history:
        'No significant medical history. No prior back injuries. No surgeries. No chronic conditions. NKDA.',
      medications: 'None',
      suggestedQuestions: [
        'Any numbness, tingling, or weakness in the legs or feet?',
        'Any changes in bladder or bowel function since the injury?',
      ],
      flags: [],
    },
  },
]

/* Demo AI conversation flow */
const getDemoResponses = (firstName, reason) => [
  {
    text: `Thanks for sharing that, ${firstName}. Can you tell me when this first started? Was it sudden or gradual?`,
    delay: 1500,
  },
  {
    text: `Got it. On a scale of 1 to 10, with 10 being the worst pain imaginable, how would you rate what you're experiencing right now?`,
    delay: 1800,
  },
  {
    text: `I understand. Have you tried anything to manage the symptoms so far — any medications, home remedies, or lifestyle changes?`,
    delay: 1600,
  },
  {
    text: `That's helpful context. Do you have any ongoing medical conditions, allergies, or medications you take regularly?`,
    delay: 1700,
  },
  {
    text: `Thank you, ${firstName}. I've gathered all the key information. Let me prepare a summary for your doctor — they'll review everything before your appointment so you can make the most of your time together. You're all set!`,
    delay: 2000,
    isFinal: true,
  },
]

/* ───────────────────────── SVG Icons ───────────────────────── */

const PulseIcon = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="#0F7B6C" />
    <path
      d="M12 32 h8 l4 -12 l6 24 l6 -18 l4 6 h12"
      stroke="white"
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BackArrow = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10H5M5 10L10 5M5 10L10 15" />
  </svg>
)

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 10L17 3L10 17L9 11L3 10Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

const BotAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18" />
      <path d="M12 2C12 2 16 6 16 10C16 14 12 18 12 18" />
      <circle cx="12" cy="10" r="8" />
      <line x1="8" y1="22" x2="16" y2="22" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  </div>
)

const CheckAnimation = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
    <circle className="check-circle" cx="40" cy="40" r="36" fill="#22C55E" />
    <path className="check-mark" d="M24 40L35 51L56 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ───────────────────────── Severity Helpers ───────────────────────── */

const severityColor = (s) => (s >= 7 ? 'bg-severity-high' : s >= 4 ? 'bg-severity-medium' : 'bg-severity-low')
const severityTextColor = (s) => (s >= 7 ? 'text-severity-high' : s >= 4 ? 'text-severity-medium' : 'text-severity-low')
const severityLabel = (s) => (s >= 7 ? 'High' : s >= 4 ? 'Moderate' : 'Low')
const severityBg = (s) =>
  s >= 7 ? 'bg-red-50 text-red-700 border-red-200' : s >= 4 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'

/* ───────────────────────── Components ───────────────────────── */

/* Typing indicator dots */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 msg-enter">
      <BotAvatar />
      <div className="bg-teal-light rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="typing-dot w-2 h-2 bg-teal/40 rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-teal/40 rounded-full inline-block" />
        <span className="typing-dot w-2 h-2 bg-teal/40 rounded-full inline-block" />
      </div>
    </div>
  )
}

/* ═══════════════════ SCREEN 1: LANDING PAGE ═══════════════════ */

function LandingPage({ onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full">
        {/* Logo */}
        <div className="pulse-logo rounded-2xl fade-in">
          <PulseIcon size={72} />
        </div>

        {/* Title */}
        <div className="text-center fade-in fade-in-delay-1">
          <h1 className="text-4xl font-bold text-text-primary tracking-tight">
            Dr. Claudeis
          </h1>
          <p className="text-text-secondary mt-2 text-lg leading-relaxed">
            AI-powered intake. Better visits. Less waiting.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full mt-4 fade-in fade-in-delay-2">
          <button
            id="btn-patient"
            onClick={() => onNavigate('patient-login')}
            className="w-full py-4 px-6 bg-teal text-white font-semibold text-lg rounded-xl
                       hover:bg-teal-dark active:scale-[0.98] transition-all duration-200
                       shadow-md hover:shadow-lg cursor-pointer"
          >
            🏥 I'm a Patient
          </button>
          <button
            id="btn-doctor"
            onClick={() => onNavigate('doctor-dashboard')}
            className="w-full py-4 px-6 bg-white text-teal font-semibold text-lg rounded-xl
                       border-2 border-teal hover:bg-teal-50 active:scale-[0.98]
                       transition-all duration-200 cursor-pointer"
          >
            🩺 I'm a Doctor
          </button>
        </div>

        {/* Footer */}
        <p className="text-text-muted text-sm mt-8 fade-in fade-in-delay-3">
          Built at Claude Builder Club · UW Waterloo 2026
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════ SCREEN 2: PATIENT LOGIN ═══════════════════ */

function PatientLogin({ onNavigate, onSubmit }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    reason: '',
  })

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const isValid = form.firstName && form.lastName && form.dob && form.reason

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isValid) onSubmit(form)
  }

  const inputClasses =
    'w-full px-4 py-3.5 rounded-xl border border-border bg-white text-text-primary placeholder:text-text-muted text-base transition-all duration-200'

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 sm:py-12">
      {/* Back button */}
      <div className="w-full max-w-md mb-4 fade-in">
        <button
          id="btn-back-login"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 text-text-secondary hover:text-teal transition-colors cursor-pointer text-sm font-medium"
        >
          <BackArrow /> Back
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden fade-in fade-in-delay-1">
        {/* Privacy banner */}
        <div className="bg-teal-light px-5 py-3.5 border-b border-teal-50">
          <p className="text-sm text-teal font-medium flex items-center gap-2">
            <span className="text-base">🔒</span> Your information is only shared with your doctor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">First Name</label>
              <input
                id="input-first-name"
                type="text"
                placeholder="Jane"
                value={form.firstName}
                onChange={update('firstName')}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Last Name</label>
              <input
                id="input-last-name"
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={update('lastName')}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Date of Birth</label>
            <input
              id="input-dob"
              type="date"
              value={form.dob}
              onChange={update('dob')}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Reason for Visit</label>
            <select
              id="select-reason"
              value={form.reason}
              onChange={update('reason')}
              className={`${inputClasses} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2012%2012%27%3E%3Cpath%20d%3D%27M2%204l4%204%204-4%27%20stroke%3D%27%235A6A7A%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20stroke-linecap%3D%27round%27/%3E%3C/svg%3E")] bg-no-repeat bg-[right_16px_center]`}
            >
              <option value="">Select a reason…</option>
              {VISIT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            id="btn-start-intake"
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-semibold text-base mt-2 transition-all duration-200 cursor-pointer
              ${isValid
                ? 'bg-teal text-white hover:bg-teal-dark shadow-md hover:shadow-lg active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            Start My Intake
          </button>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════ SCREEN 3: AI CHAT ═══════════════════ */

function ChatInterface({ patientInfo, onEndSession }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hi ${patientInfo.firstName}! I'm Dr. Claudeis, your AI intake assistant. I'm here to help your doctor prepare for your visit.\n\nI won't diagnose anything — I just gather information so your appointment is more efficient.\n\nLet's start: can you describe your main concern today?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const demoResponses = getDemoResponses(patientInfo.firstName, patientInfo.reason)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const sendMessage = () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setInput('')
    setIsTyping(true)

    const currentStep = demoStep
    if (currentStep < demoResponses.length) {
      setTimeout(() => {
        setIsTyping(false)
        const response = demoResponses[currentStep]
        setMessages((prev) => [...prev, { role: 'ai', text: response.text }])
        setDemoStep((s) => s + 1)

        if (response.isFinal) {
          setTimeout(() => onEndSession(), 2500)
        }
      }, demoResponses[currentStep].delay)
    } else {
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `Thank you for sharing that, ${patientInfo.firstName}. I've captured all the important details. Your doctor will review this summary before your appointment.`,
          },
        ])
        setTimeout(() => onEndSession(), 2500)
      }, 1500)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-dvh max-h-dvh">
      {/* Top bar */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <PulseIcon size={32} />
          <span className="font-semibold text-text-primary">Dr. Claudeis</span>
        </div>
        <button
          id="btn-end-session"
          onClick={onEndSession}
          className="text-sm text-text-muted hover:text-severity-high transition-colors cursor-pointer font-medium"
        >
          End Session
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 chat-scroll bg-bg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 msg-enter ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'ai' && <BotAvatar />}
            <div
              className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 text-[15px] leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-teal text-white rounded-2xl rounded-br-sm'
                  : 'bg-teal-light text-text-primary rounded-2xl rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            id="input-chat"
            type="text"
            placeholder="Describe your symptoms…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-text-primary
                       placeholder:text-text-muted text-[15px] transition-all duration-200
                       disabled:opacity-50"
          />
          <button
            id="btn-send"
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 cursor-pointer
              ${input.trim() && !isTyping
                ? 'bg-teal hover:bg-teal-dark active:scale-95 shadow-md'
                : 'bg-gray-200 cursor-not-allowed'
              }`}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════ SCREEN 4: DOCTOR DASHBOARD ═══════════════════ */

function DoctorDashboard({ patients, onNavigate }) {
  const [selectedId, setSelectedId] = useState(null)
  const selected = patients.find((p) => p.id === selectedId)

  return (
    <div className="flex-1 flex flex-col min-h-dvh">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <PulseIcon size={32} />
          <div>
            <h1 className="text-lg font-bold text-text-primary leading-tight">Dr. Claudeis</h1>
            <p className="text-xs text-text-muted font-medium">Provider Dashboard</p>
          </div>
        </div>
        <button
          id="btn-back-landing-doc"
          onClick={() => onNavigate('landing')}
          className="text-sm text-text-muted hover:text-teal transition-colors cursor-pointer font-medium"
        >
          Sign Out
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-6 fade-in">
            <div className="bg-white rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-teal">{patients.length}</p>
              <p className="text-xs text-text-muted font-medium mt-0.5">Patients Today</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-severity-medium">{patients.filter(p => p.severity >= 7).length}</p>
              <p className="text-xs text-text-muted font-medium mt-0.5">High Priority</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{patients.length}</p>
              <p className="text-xs text-text-muted font-medium mt-0.5">Completed</p>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 fade-in fade-in-delay-1">
            Patient Intakes
          </h2>

          {/* Patient cards */}
          <div className="flex flex-col gap-3 fade-in fade-in-delay-2">
            {patients.map((p) => (
              <div key={p.id}>
                <button
                  id={`btn-patient-${p.id}`}
                  onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                  className="w-full bg-white rounded-xl border border-border p-4 text-left card-hover cursor-pointer
                             hover:border-teal/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-light flex items-center justify-center text-teal font-bold text-sm">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-sm text-text-muted">{p.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${severityBg(p.severity)}`}>
                        {severityLabel(p.severity)}
                      </span>
                      <span className="text-xs text-text-muted">{p.completedAt}</span>
                      <svg
                        width="16" height="16" viewBox="0 0 16 16" fill="none"
                        className={`text-text-muted transition-transform duration-200 ${selectedId === p.id ? 'rotate-180' : ''}`}
                      >
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded summary */}
                {selectedId === p.id && (
                  <div className="bg-white border border-t-0 border-border rounded-b-xl px-5 py-5 -mt-1 fade-in">
                    <PatientSummary patient={p} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Patient Summary Detail */
function PatientSummary({ patient }) {
  const { summary, severity } = patient

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* Chief Complaint */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Chief Complaint</h3>
        <p className="text-[15px] font-medium text-text-primary leading-relaxed">{summary.chiefComplaint}</p>
      </div>

      {/* Severity */}
      <div className="flex items-center gap-3">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Severity</h3>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${severity >= 7 ? 'bg-severity-high' : severity >= 4 ? 'bg-severity-medium' : 'bg-severity-low'}`}
              style={{ width: `${severity * 10}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${severityTextColor(severity)}`}>{severity}/10</span>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Symptom Timeline</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{summary.timeline}</p>
      </div>

      {/* Self Treatment */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Self-Treatment Attempted</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{summary.selfTreatment}</p>
      </div>

      {/* Medical History */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Medical History & Medications</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{summary.history}</p>
        {summary.medications && (
          <p className="text-sm text-text-secondary mt-1">
            <span className="font-medium text-text-primary">Current medications:</span> {summary.medications}
          </p>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="bg-teal-light rounded-xl p-4 border border-teal/10">
        <h3 className="text-xs font-semibold text-teal uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5.5 5.5C5.5 4.67 6.17 4 7 4C7.83 4 8.5 4.67 8.5 5.5C8.5 6.33 7.83 7 7 7V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="7" cy="10" r="0.75" fill="currentColor" />
          </svg>
          Suggested Questions
        </h3>
        <ul className="flex flex-col gap-2">
          {summary.suggestedQuestions.map((q, i) => (
            <li key={i} className="text-sm text-teal-dark flex gap-2">
              <span className="text-teal font-medium mt-0.5">→</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Flags */}
      {summary.flags.length > 0 && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h3 className="text-xs font-semibold text-severity-high uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 12H1L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <line x1="7" y1="5" x2="7" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="7" cy="10" r="0.75" fill="currentColor" />
            </svg>
            Flags
          </h3>
          <ul className="flex flex-col gap-2">
            {summary.flags.map((f, i) => (
              <li key={i} className="text-sm text-red-700 flex gap-2">
                <span className="text-severity-high font-medium mt-0.5">⚠</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════ SCREEN 5: SUMMARY CONFIRMATION ═══════════════════ */

function SummaryConfirmation({ patientInfo, onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-sm w-full bg-card rounded-2xl shadow-lg border border-border/50 p-8 text-center fade-in">
        {/* Check animation */}
        <div className="flex justify-center mb-6">
          <CheckAnimation />
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-2 fade-in fade-in-delay-1">
          Your intake is complete!
        </h2>

        <p className="text-text-secondary leading-relaxed mb-6 fade-in fade-in-delay-2">
          A summary has been prepared for your doctor. They'll review it before your appointment.
        </p>

        <p className="text-sm text-text-muted mb-6 fade-in fade-in-delay-3">
          You can close this page or wait here.
        </p>

        <div className="bg-teal-light rounded-xl p-4 fade-in fade-in-delay-4">
          <p className="text-sm text-teal leading-relaxed">
            <span className="font-medium">Remember</span> — your doctor makes all medical decisions. This summary just helps them prepare.
          </p>
        </div>

        <button
          id="btn-back-home"
          onClick={() => onNavigate('landing')}
          className="mt-6 text-sm text-text-muted hover:text-teal transition-colors cursor-pointer font-medium fade-in fade-in-delay-4"
        >
          ← Return to Home
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════ MAIN APP ═══════════════════ */

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [patientInfo, setPatientInfo] = useState(null)
  const [patients, setPatients] = useState(MOCK_PATIENTS)

  const handlePatientSubmit = (form) => {
    setPatientInfo(form)
    setScreen('chat')
  }

  const handleEndSession = () => {
    // If we have patient info, add them to the dashboard
    if (patientInfo) {
      const newPatient = {
        id: Date.now(),
        firstName: patientInfo.firstName,
        lastName: patientInfo.lastName,
        dob: patientInfo.dob,
        reason: patientInfo.reason,
        completedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        severity: Math.floor(Math.random() * 5) + 3,
        summary: {
          chiefComplaint: `Patient reports ${patientInfo.reason.toLowerCase()} as their primary concern. Details gathered during AI-assisted intake.`,
          timeline: 'Details collected during intake session. Refer to chat transcript for full timeline.',
          selfTreatment: 'Information gathered during intake — see chat transcript.',
          history: 'See intake transcript for full medical history discussion.',
          medications: 'Discussed during intake session.',
          suggestedQuestions: [
            `Follow up on the specifics of their ${patientInfo.reason.toLowerCase()}.`,
            'Clarify any medication interactions or allergies.',
            'Discuss treatment options and follow-up plan.',
          ],
          flags: [],
        },
      }
      setPatients((prev) => [newPatient, ...prev])
    }
    setScreen('summary')
  }

  const navigate = (target) => {
    setScreen(target)
    if (target === 'landing') {
      setPatientInfo(null)
    }
  }

  return (
    <>
      {screen === 'landing' && <LandingPage onNavigate={navigate} />}
      {screen === 'patient-login' && (
        <PatientLogin onNavigate={navigate} onSubmit={handlePatientSubmit} />
      )}
      {screen === 'chat' && patientInfo && (
        <ChatInterface patientInfo={patientInfo} onEndSession={handleEndSession} />
      )}
      {screen === 'doctor-dashboard' && (
        <DoctorDashboard patients={patients} onNavigate={navigate} />
      )}
      {screen === 'summary' && (
        <SummaryConfirmation patientInfo={patientInfo} onNavigate={navigate} />
      )}
    </>
  )
}
