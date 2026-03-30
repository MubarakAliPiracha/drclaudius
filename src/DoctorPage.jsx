import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePatients } from './context/PatientContext'

// SVG Icons
function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
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

function ClipboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H9a1 1 0 0 0-1 1v2h8V3a1 1 0 0 0-1-1Z" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

// Time ago helper
function timeAgo(timestamp) {
  if (!timestamp) return ''
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

// Severity badge
function SeverityBadge({ severity }) {
  const num = parseInt(severity)
  let bg, color
  if (num <= 3) {
    bg = '#DCFCE7'
    color = '#16A34A'
  } else if (num <= 6) {
    bg = '#FEF3C7'
    color = '#D97706'
  } else {
    bg = '#FEE2E2'
    color = '#EF4444'
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, color, fontFamily: '"Space Mono", monospace' }}
    >
      {severity}
    </span>
  )
}

// ============================================================
// PATIENT CARD
// ============================================================
function PatientCard({ patient, isExpanded, onToggle }) {
  const isNew = !patient._mock
  const isRecent = patient._timestamp && (Date.now() - patient._timestamp) < 3600000 // < 1 hour

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden transition-shadow duration-200"
      style={{
        background: '#FFFCF7',
        border: isNew ? '1px solid #D97706' : '1px solid #E8E0D4',
        boxShadow: isExpanded
          ? '0 4px 20px rgba(0,0,0,0.06)'
          : isNew
            ? '0 2px 12px rgba(217,119,6,0.08)'
            : '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 cursor-pointer text-left hover:bg-black/[0.01] transition-colors"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isNew ? '#FEF3C7' : '#F5F0E8', color: '#2D2D3A' }}
        >
          <UserIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }} className="text-base font-medium truncate">
              {patient.patient_name}
            </p>
            {isNew && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                style={{ background: '#FEF3C7', color: '#D97706', fontFamily: '"Inter", sans-serif' }}
              >
                NEW
              </span>
            )}
            {isRecent && isNew && (
              <span
                className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                style={{ background: '#4ADE80' }}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-xs truncate">
              {patient.chief_complaint}
            </p>
            {patient._timestamp && (
              <span
                className="flex items-center gap-1 shrink-0 text-[11px]"
                style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }}
              >
                <ClockIcon />
                {timeAgo(patient._timestamp)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SeverityBadge severity={patient.severity} />
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: '#8B8B9E' }}
          >
            <ChevronDown />
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5" style={{ borderTop: '1px solid #E8E0D4' }}>
              <div className="pt-4 space-y-4">
                {/* Fields grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Symptoms" value={patient.symptom_description} />
                  <Field label="Onset" value={patient.onset} />
                  <Field label="Progression" value={patient.progression} />
                  <Field label="Self-treatment" value={patient.self_treatment} />
                  <Field label="Medical history" value={patient.medical_history} />
                  <Field label="Medications" value={patient.medications} />
                </div>

                {patient.additional_notes && (
                  <Field label="Additional notes" value={patient.additional_notes} full />
                )}

                {/* Suggested questions */}
                {patient.suggested_doctor_questions?.length > 0 && (
                  <div>
                    <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-xs uppercase tracking-wider font-medium mb-2">
                      Suggested questions
                    </p>
                    <ul className="space-y-1.5">
                      {patient.suggested_doctor_questions.map((q, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                          style={{ fontFamily: '"Inter", sans-serif', color: '#2D2D3A' }}
                        >
                          <span style={{ color: '#D97706' }} className="mt-0.5 shrink-0">
                            <ClipboardIcon />
                          </span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Flags */}
                {patient.flags?.length > 0 && (
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{ background: '#FEF2F2' }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span style={{ color: '#EF4444' }}><FlagIcon /></span>
                      <p style={{ fontFamily: '"Inter", sans-serif', color: '#EF4444' }} className="text-xs font-semibold uppercase tracking-wider">
                        Flags
                      </p>
                    </div>
                    {patient.flags.map((f, i) => (
                      <p
                        key={i}
                        style={{ fontFamily: '"Inter", sans-serif', color: '#DC2626' }}
                        className="text-sm"
                      >
                        {f}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Field({ label, value, full = false }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-[11px] uppercase tracking-wider font-medium mb-0.5">
        {label}
      </p>
      <p style={{ fontFamily: '"Inter", sans-serif', color: '#2D2D3A' }} className="text-sm">
        {value || '\u2014'}
      </p>
    </div>
  )
}

// ============================================================
// MAIN DOCTOR PAGE
// ============================================================
export default function DoctorPage() {
  const navigate = useNavigate()
  const { summaries } = usePatients()
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'active'
  const [, setTick] = useState(0)

  // Re-render every 30s so "time ago" labels stay fresh
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const realCount = summaries.filter((s) => !s._mock).length

  // Active = submitted within the last 24 hours (real patients only)
  const activeSummaries = summaries.filter(
    (s) => !s._mock && s._timestamp && (Date.now() - s._timestamp) < 86400000
  )

  const displayed = filter === 'active' ? activeSummaries : summaries

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-3 sticky top-0 z-20"
        style={{ borderBottom: '1px solid #E8E0D4', background: '#FFFCF7' }}
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg cursor-pointer hover:bg-black/5 transition-colors"
          style={{ color: '#2D2D3A' }}
        >
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#D97706' }}
          >
            <SparkleIcon size={16} />
          </div>
          <div>
            <p style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }} className="text-sm font-medium leading-tight">
              Doctor Dashboard
            </p>
            <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-xs">
              {summaries.length} patient{summaries.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        {realCount > 0 && (
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: '#FEF3C7', color: '#D97706', fontFamily: '"Space Mono", monospace' }}
          >
            {realCount} new
          </span>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setFilter('active'); setExpandedIdx(null) }}
            className="px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all"
            style={{
              fontFamily: '"Inter", sans-serif',
              background: filter === 'active' ? '#D97706' : 'transparent',
              color: filter === 'active' ? '#fff' : '#8B8B9E',
              border: filter === 'active' ? '1px solid #D97706' : '1px solid #E8E0D4',
            }}
          >
            Active
            {activeSummaries.length > 0 && (
              <span
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={{
                  background: filter === 'active' ? 'rgba(255,255,255,0.25)' : '#FEF3C7',
                  color: filter === 'active' ? '#fff' : '#D97706',
                }}
              >
                {activeSummaries.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setFilter('all'); setExpandedIdx(null) }}
            className="px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all"
            style={{
              fontFamily: '"Inter", sans-serif',
              background: filter === 'all' ? '#D97706' : 'transparent',
              color: filter === 'all' ? '#fff' : '#8B8B9E',
              border: filter === 'all' ? '1px solid #D97706' : '1px solid #E8E0D4',
            }}
          >
            All Patients
          </button>
        </div>

        {/* Patient list */}
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-sm">
                {filter === 'active'
                  ? 'No active patients in the last 24 hours.'
                  : 'No patients have completed intake yet.'}
              </p>
            </div>
          ) : (
            displayed.map((patient, i) => (
              <PatientCard
                key={`${patient.patient_name}-${patient._timestamp}-${i}`}
                patient={patient}
                isExpanded={expandedIdx === i}
                onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
