import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import LandingPage from './LandingPage'
import PatientPage from './PatientPage'
import DoctorPage from './DoctorPage'

function LandingWrapper() {
  const navigate = useNavigate()

  const handleSelectRole = (role) => {
    if (role === 'patient') navigate('/patient')
    if (role === 'doctor') navigate('/doctor')
  }

  return <LandingPage onSelectRole={handleSelectRole} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/patient" element={<PatientPage />} />
        <Route path="/doctor" element={<DoctorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
