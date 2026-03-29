import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function DoctorPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#F5F0E8', fontFamily: '"Inter", sans-serif' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="text-center max-w-lg"
      >
        <div className="text-6xl mb-6">🩺</div>
        <h1
          style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
          className="text-4xl md:text-5xl mb-4"
        >
          Welcome, Doctor
        </h1>
        <p style={{ color: '#8B8B9E' }} className="text-lg mb-8 leading-relaxed">
          Review AI-prepared patient summaries and walk into every appointment informed.
        </p>

        <div className="flex flex-col gap-4 items-center">
          <button
            className="w-64 py-4 px-8 text-white font-semibold text-lg rounded-full cursor-pointer hover:scale-105 active:scale-[0.98] transition-all duration-200"
            style={{ background: '#D97706', boxShadow: '0 8px 30px rgba(217,119,6,0.3)' }}
          >
            View Patient Summaries
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-sm cursor-pointer hover:underline transition-all"
            style={{ color: '#8B8B9E' }}
          >
            &larr; Back to home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
