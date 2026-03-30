import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'drclaudius_summaries'

const MOCK_PATIENTS = [
  {
    patient_name: 'Sarah Chen',
    chief_complaint: 'Recurring headaches, increasing frequency',
    symptom_description: 'Throbbing right-side headaches, light sensitivity, nausea',
    onset: '2 weeks ago, history since age 16',
    progression: 'getting worse',
    severity: '7/10',
    self_treatment: 'Ibuprofen 400mg, temporary relief',
    medical_history: 'Migraines since age 16',
    medications: 'Occasional ibuprofen',
    additional_notes: 'Increased screen time, irregular sleep',
    suggested_doctor_questions: [
      'Has headache character changed vs previous migraines?',
      'Any visual aura preceding headaches?',
      'Discuss preventive management?',
    ],
    flags: ['Increasing frequency \u2014 consider imaging'],
    _mock: true,
    _timestamp: Date.now() - 3600000,
  },
  {
    patient_name: 'James Wilson',
    chief_complaint: 'Lower back pain after lifting',
    symptom_description: 'Sharp lower back pain, worse bending, no leg numbness',
    onset: '3 days ago after lifting boxes',
    progression: 'stable',
    severity: '5/10',
    self_treatment: 'Heat pad and rest',
    medical_history: 'None',
    medications: 'None',
    additional_notes: 'Walks normally, difficulty bending',
    suggested_doctor_questions: [
      'Any leg numbness or tingling?',
      'Bladder/bowel changes?',
      'Physiotherapy referral appropriate?',
    ],
    flags: [],
    _mock: true,
    _timestamp: Date.now() - 7200000,
  },
]

function loadSummaries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge: stored real patients first, then mocks
      return [...parsed, ...MOCK_PATIENTS]
    }
  } catch {
    // corrupted storage, ignore
  }
  return MOCK_PATIENTS
}

function persistRealSummaries(summaries) {
  const real = summaries.filter((s) => !s._mock)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(real))
}

const PatientContext = createContext(null)

export function PatientProvider({ children }) {
  const [summaries, setSummaries] = useState(loadSummaries)

  // Persist real summaries whenever they change
  useEffect(() => {
    persistRealSummaries(summaries)
  }, [summaries])

  const addSummary = (summary) => {
    setSummaries((prev) => [{ ...summary, _mock: false, _timestamp: Date.now() }, ...prev])
  }

  return (
    <PatientContext.Provider value={{ summaries, addSummary }}>
      {children}
    </PatientContext.Provider>
  )
}

export function usePatients() {
  const ctx = useContext(PatientContext)
  if (!ctx) throw new Error('usePatients must be inside PatientProvider')
  return ctx
}
