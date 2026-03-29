import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import mapboxgl from 'mapbox-gl'

// ============================================================
// CONSTANTS
// ============================================================
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const GEOJSON_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/canada.geojson'

// Province wait-time data (west → east)
const PROVINCE_DATA = {
  'British Columbia': { abbr: 'BC', weeks: 32.2, color: '#FACC15' },
  Alberta: { abbr: 'AB', weeks: 36.0, color: '#F97316' },
  Saskatchewan: { abbr: 'SK', weeks: 34.8, color: '#F97316' },
  Manitoba: { abbr: 'MB', weeks: 37.3, color: '#F97316' },
  Ontario: { abbr: 'ON', weeks: 19.2, color: '#4ADE80' },
  Quebec: { abbr: 'QC', weeks: 32.5, color: '#FACC15' },
  'New Brunswick': { abbr: 'NB', weeks: 60.9, color: '#991B1B', pulse: true },
  'Prince Edward Island': { abbr: 'PEI', weeks: 49.7, color: '#DC2626' },
  'Nova Scotia': { abbr: 'NS', weeks: 49.0, color: '#EF4444' },
  'Newfoundland and Labrador': { abbr: 'NL', weeks: 43.5, color: '#EF4444' },
}

// West → east order for stagger
const PROVINCE_ORDER = [
  'British Columbia',
  'Alberta',
  'Saskatchewan',
  'Manitoba',
  'Ontario',
  'Quebec',
  'New Brunswick',
  'Nova Scotia',
  'Prince Edward Island',
  'Newfoundland and Labrador',
]

// ============================================================
// ANIMATION HELPERS
// ============================================================
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1 },
}

const spring = { type: 'spring', stiffness: 100, damping: 15 }

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardVariant = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 18 },
  },
}

// ============================================================
// LOGO: Stethoscope with Claude ✦ sparkle chest piece
// ============================================================
function Logo({ size = 80, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
    >
      {/* Stethoscope tubing */}
      <path
        d="M30 15 C30 15, 25 20, 25 35 C25 55, 35 65, 50 70 C65 65, 75 55, 75 35 C75 20, 70 15, 70 15"
        stroke="#D97706"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Earpieces */}
      <circle cx="30" cy="12" r="4" fill="#D97706" />
      <circle cx="70" cy="12" r="4" fill="#D97706" />
      {/* Claude sparkle ✦ as chest piece */}
      <path
        d="M50 62 L53 72 L50 82 L47 72 Z"
        fill="#D97706"
      />
      <path
        d="M40 72 L47 69 L60 72 L53 75 Z"
        fill="#D97706"
      />
      <circle cx="50" cy="72" r="3" fill="#F5F0E8" />
    </svg>
  )
}

// ============================================================
// HELPER: CountUp
// ============================================================
function CountUp({ target, decimals = 1, duration = 2 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView || !ref.current) return
    const controls = animate(0, target, {
      duration,
      onUpdate(v) {
        if (ref.current) ref.current.textContent = v.toFixed(decimals)
      },
    })
    return () => controls.stop()
  }, [isInView, target, decimals, duration])

  return <span ref={ref}>0</span>
}

// ============================================================
// SECTION 1: THE HOOK
// ============================================================
function HookSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="snap-section" style={{ background: '#1A1A2E' }}>
      {/* Subtle radial pulse */}
      <div
        className="absolute w-80 h-80 md:w-[500px] md:h-[500px] rounded-full animate-pulse-glow pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center px-6">
        {/* Big number */}
        <div
          className="font-bold leading-none tracking-tight"
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: 'clamp(5rem, 12vw, 10rem)',
            color: '#F5F0E8',
          }}
        >
          <CountUp target={28.6} />
        </div>

        {/* "weeks" */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.5, ...spring }}
          style={{ fontFamily: '"Newsreader", serif', color: 'rgba(245,240,232,0.8)' }}
          className="text-3xl md:text-5xl italic mt-2 md:mt-4"
        >
          weeks
        </motion.p>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={{ delay: 0.9, ...spring }}
          style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }}
          className="text-lg md:text-2xl mt-6 md:mt-8 max-w-lg mx-auto leading-relaxed"
        >
          That&rsquo;s how long Canadians wait for care.
        </motion.p>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 md:bottom-10"
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </motion.div>
    </section>
  )
}

// ============================================================
// SECTION 2: CANADA MAP (Mapbox)
// ============================================================
function MapSection() {
  const sectionRef = useRef(null)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const popupRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const [mapReady, setMapReady] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map once in view
  useEffect(() => {
    if (!isInView || mapRef.current || !mapContainerRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-96.5, 60.0],
      zoom: 3.2,
      interactive: false,
      attributionControl: false,
    })

    // Disable all interactions
    map.scrollZoom.disable()
    map.boxZoom.disable()
    map.dragRotate.disable()
    map.dragPan.disable()
    map.keyboard.disable()
    map.doubleClickZoom.disable()
    map.touchZoomRotate.disable()

    mapRef.current = map

    map.on('load', () => {
      setMapReady(true)

      // Fetch GeoJSON and add layers
      fetch(GEOJSON_URL)
        .then((r) => r.json())
        .then((geojson) => {
          // Add each province with staggered appearance
          PROVINCE_ORDER.forEach((name, i) => {
            const data = PROVINCE_DATA[name]
            if (!data) return

            const filtered = {
              type: 'FeatureCollection',
              features: geojson.features.filter((f) => f.properties.name === name),
            }

            if (filtered.features.length === 0) return

            const sourceId = `province-${data.abbr}`
            const layerId = `layer-${data.abbr}`

            // Add source + layer after a stagger delay
            setTimeout(() => {
              if (!mapRef.current) return

              map.addSource(sourceId, { type: 'geojson', data: filtered })

              map.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                  'fill-color': data.color,
                  'fill-opacity': 0,
                  'fill-outline-color': 'rgba(245,240,232,0.15)',
                },
              })

              // Animate opacity in
              let opacity = 0
              const interval = setInterval(() => {
                opacity += 0.05
                if (opacity >= 0.85) {
                  opacity = 0.85
                  clearInterval(interval)
                }
                try {
                  map.setPaintProperty(layerId, 'fill-opacity', opacity)
                } catch {
                  clearInterval(interval)
                }
              }, 30)

              // Pulsing for NB
              if (data.pulse) {
                let dir = -1
                let pulseOp = 0.85
                setInterval(() => {
                  pulseOp += dir * 0.02
                  if (pulseOp <= 0.4) dir = 1
                  if (pulseOp >= 0.85) dir = -1
                  try {
                    map.setPaintProperty(layerId, 'fill-opacity', pulseOp)
                  } catch { /* map destroyed */ }
                }, 50)
              }

              if (i === PROVINCE_ORDER.length - 1) {
                setTimeout(() => setMapLoaded(true), 400)
              }
            }, i * 150)
          })

          // Hover tooltip
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15,
            className: 'province-popup',
          })
          popupRef.current = popup

          const allLayerIds = PROVINCE_ORDER.map(
            (n) => `layer-${PROVINCE_DATA[n]?.abbr}`
          ).filter(Boolean)

          allLayerIds.forEach((lid) => {
            map.on('mouseenter', lid, () => {
              map.getCanvas().style.cursor = 'pointer'
            })
            map.on('mouseleave', lid, () => {
              map.getCanvas().style.cursor = ''
              popup.remove()
            })
            map.on('mousemove', lid, (e) => {
              const name = e.features?.[0]?.properties?.name
              const pData = PROVINCE_DATA[name]
              if (!pData) return
              popup
                .setLngLat(e.lngLat)
                .setHTML(
                  `<div style="font-family:Inter,sans-serif;padding:4px 0">
                     <strong>${name}</strong><br/>
                     <span style="color:${pData.color};font-weight:700">${pData.weeks} weeks</span>
                   </div>`
                )
                .addTo(map)
            })
          })
        })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [isInView])

  return (
    <section ref={sectionRef} className="snap-section" style={{ background: '#1A1A2E' }}>
      {/* Headline */}
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        transition={spring}
        style={{ fontFamily: '"Newsreader", serif', color: '#F5F0E8' }}
        className="text-3xl md:text-5xl lg:text-6xl italic text-center mb-6 md:mb-10 px-4"
      >
        A coast-to-coast crisis
      </motion.h2>

      {/* Mapbox container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="relative w-full max-w-5xl mx-auto px-4"
        style={{ height: '45vh', maxHeight: '500px' }}
      >
        <div
          ref={mapContainerRef}
          className="w-full h-full rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(245,240,232,0.08)' }}
        />
      </motion.div>

      {/* Bottom stat */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate={mapLoaded ? 'visible' : 'hidden'}
        transition={spring}
        style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }}
        className="text-base md:text-xl text-center mt-6 md:mt-10 px-6 max-w-2xl mx-auto"
      >
        <span style={{ color: '#F5F0E8', fontWeight: 600 }}>1.4 million</span> Canadians are waiting for a procedure right now.
      </motion.p>
    </section>
  )
}

// ============================================================
// SECTION 3: DOCTOR'S MATH
// ============================================================
function DoctorsMathSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
      setTimeout(() => setStep(5), 3500),
      setTimeout(() => setStep(6), 4200),
      setTimeout(() => setStep(7), 5000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isInView])

  return (
    <section ref={ref} className="snap-section" style={{ background: '#F5F0E8' }}>
      <div className="text-center px-6 max-w-3xl mx-auto">
        {/* Headline */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={spring}
          style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
          className="text-3xl md:text-5xl lg:text-6xl mb-10 md:mb-16"
        >
          A doctor&rsquo;s impossible math
        </motion.h2>

        {/* 30 dots */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={step >= 1 ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-2 mb-6 max-w-xs mx-auto"
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={step >= 1 ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
              className="w-4 h-4 md:w-5 md:h-5 rounded-full"
              style={{ background: '#2D2D3A' }}
            />
          ))}
        </motion.div>

        {/* Math lines */}
        <div className="space-y-3 md:space-y-4 text-lg md:text-2xl" style={{ fontFamily: '"Inter", sans-serif' }}>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={step >= 1 ? 'visible' : 'hidden'}
            transition={spring}
            style={{ color: '#2D2D3A' }}
          >
            <span className="font-bold">30 patients</span>/day × <span className="font-bold">15 min</span>
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={step >= 3 ? 'visible' : 'hidden'}
            transition={spring}
            className="text-2xl md:text-3xl font-bold"
            style={{ color: '#EF4444' }}
          >
            = 7.5 hours on intake alone
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={step >= 4 ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="h-px my-4 md:my-6 origin-left"
            style={{ background: 'linear-gradient(to right, transparent, #E8E0D4, transparent)' }}
          />

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={step >= 4 ? 'visible' : 'hidden'}
            transition={spring}
            style={{ color: '#4ADE80' }}
            className="font-semibold text-xl md:text-2xl"
          >
            With Dr. Claudeis: 30 × 2 min review
          </motion.p>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={step >= 6 ? 'visible' : 'hidden'}
            transition={spring}
            className="text-2xl md:text-3xl font-bold"
            style={{ color: '#4ADE80' }}
          >
            = 1 hour
          </motion.p>
        </div>

        {/* Big reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={step >= 7 ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 12 }}
          className="mt-8 md:mt-12 relative"
        >
          <div
            className="absolute inset-0 blur-3xl rounded-full pointer-events-none"
            style={{ background: 'rgba(74,222,128,0.1)' }}
          />
          <p
            style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
            className="text-3xl md:text-5xl lg:text-6xl italic relative z-10"
          >
            <span style={{ color: '#4ADE80' }} className="font-bold not-italic">6.5 hours</span> saved.
            <br />
            <span style={{ color: '#8B8B9E' }}>Every single day.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// SECTION 4: MEET DR. CLAUDEIS
// ============================================================
function MeetSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 2 L19 12 L16 22 L13 12 Z" fill="#D97706" />
          <path d="M6 12 L13 9 L26 12 L19 15 Z" fill="#D97706" />
          <circle cx="16" cy="12" r="2.5" fill="#FFFCF7" />
        </svg>
      ),
      title: 'Smart Intake',
      desc: 'Patients chat with AI in the waiting room — no clipboard, no forms.',
    },
    {
      icon: <span className="text-3xl">📋</span>,
      title: 'Instant Summary',
      desc: 'Structured reports ready before the doctor walks in.',
    },
    {
      icon: <span className="text-3xl">🛡️</span>,
      title: 'Doctor Decides',
      desc: 'AI prepares. Humans diagnose. Always.',
    },
  ]

  return (
    <section ref={ref} className="snap-section" style={{ background: '#F5F0E8' }}>
      <div className="text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 120, damping: 10 }}
          className="mx-auto mb-6"
        >
          <Logo size={100} />
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.2, ...spring }}
          style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
          className="text-4xl md:text-6xl lg:text-7xl mb-3"
        >
          Dr. Claudeis
        </motion.h2>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.4, ...spring }}
          style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }}
          className="text-lg md:text-2xl mb-12 md:mb-16"
        >
          AI-powered intake. Better visits. Less waiting.
        </motion.p>

        {/* Feature cards */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariant}
              className="rounded-2xl p-6 md:p-8 hover:-translate-y-1 transition-all duration-300 cursor-default"
              style={{
                background: '#FFFCF7',
                border: '1px solid #E8E0D4',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              }}
            >
              <div className="mb-4 flex justify-center">{f.icon}</div>
              <h3
                style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
                className="text-xl md:text-2xl mb-2"
              >
                {f.title}
              </h3>
              <p
                style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }}
                className="text-sm md:text-base leading-relaxed"
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// SECTION 5: HOW IT WORKS
// ============================================================
function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const steps = [
    { icon: '📱', title: 'Scan QR', desc: 'Patient scans a code in the waiting room' },
    { icon: '💬', title: 'Chat with AI', desc: 'Warm, structured conversation gathers history' },
    { icon: '📄', title: 'Summary generated', desc: 'Complaint, history, severity, red flags — all structured' },
    { icon: '✅', title: 'Doctor walks in informed', desc: 'No more starting from scratch' },
  ]

  return (
    <section ref={ref} className="snap-section" style={{ background: '#F5F0E8' }}>
      <div className="text-center px-6 max-w-3xl mx-auto">
        {/* Headline */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          transition={spring}
          style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
          className="text-3xl md:text-5xl lg:text-6xl mb-12 md:mb-16"
        >
          Four steps. Zero wasted time.
        </motion.h2>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Animated vertical line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
            className="absolute left-6 md:left-10 top-0 bottom-0 w-[2px] origin-top hidden md:block"
            style={{
              background: 'linear-gradient(to bottom, #D97706, #E8735A)',
            }}
          />

          <div className="space-y-6 md:space-y-10">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -40 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.5, ...spring }}
                className="flex items-start gap-4 md:gap-8 text-left"
              >
                {/* Step circle */}
                <div
                  className="w-12 h-12 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl md:text-4xl shrink-0 relative z-10"
                  style={{
                    background: '#FFFCF7',
                    border: '2px solid #E8E0D4',
                  }}
                >
                  {s.icon}
                </div>

                {/* Content */}
                <div className="pt-1 md:pt-3">
                  <h3
                    style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
                    className="text-xl md:text-2xl mb-1"
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }} className="text-sm md:text-base">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// SECTION 6: OUR PROMISE
// ============================================================
function PromiseSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 3200),
      setTimeout(() => setStep(4), 4500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isInView])

  return (
    <section ref={ref} className="snap-section" style={{ background: '#D97706' }}>
      <div className="text-center px-6 max-w-3xl mx-auto">
        {/* "We never diagnose." */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={step >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="mb-6 md:mb-10"
        >
          <p
            style={{ fontFamily: '"Newsreader", serif' }}
            className="text-3xl md:text-5xl lg:text-6xl text-white"
          >
            We never{' '}
            <span className="relative inline-block">
              diagnose.
              <motion.span
                initial={{ width: 0 }}
                animate={step >= 1 ? { width: '100%' } : {}}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
                className="strike-line"
              />
            </span>
          </p>
        </motion.div>

        {/* "We never prescribe." */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={step >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={spring}
          className="mb-6 md:mb-10"
        >
          <p
            style={{ fontFamily: '"Newsreader", serif' }}
            className="text-3xl md:text-5xl lg:text-6xl text-white"
          >
            We never{' '}
            <span className="relative inline-block">
              prescribe.
              <motion.span
                initial={{ width: 0 }}
                animate={step >= 2 ? { width: '100%' } : {}}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeInOut' }}
                className="strike-line"
              />
            </span>
          </p>
        </motion.div>

        {/* "We prepare." — BIG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={step >= 3 ? { opacity: 1, scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 80, damping: 10 }}
          className="relative mb-10 md:mb-14"
        >
          <div
            className="absolute inset-0 blur-3xl rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <p
            style={{
              fontFamily: '"Newsreader", serif',
              textShadow: '0 0 60px rgba(255,255,255,0.3)',
            }}
            className="text-4xl md:text-6xl lg:text-8xl text-white font-bold relative z-10"
          >
            We prepare.
          </p>
        </motion.div>

        {/* Philosophy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={step >= 4 ? { opacity: 0.6 } : {}}
          transition={{ duration: 1 }}
          style={{ fontFamily: '"Inter", sans-serif' }}
          className="text-base md:text-xl text-white max-w-xl mx-auto leading-relaxed"
        >
          Dr. Claudeis believes doctors should decide. AI should serve.
        </motion.p>
      </div>
    </section>
  )
}

// ============================================================
// SECTION 7: CTA
// ============================================================
function CTASection({ onSelectRole }) {
  return (
    <section
      className="snap-section relative"
      style={{ background: 'linear-gradient(180deg, #F5F0E8 0%, #FFF8F0 100%)' }}
    >
      {/* Floating medical icons at 5% opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stethoscope */}
        <div className="float-1 absolute top-[15%] left-[8%] opacity-[0.05]">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <circle cx="12" cy="18" r="2" />
            <path d="M18 15a6 6 0 0 0-6 6v0" />
          </svg>
        </div>
        {/* Heartbeat */}
        <div className="float-2 absolute top-[20%] right-[12%] opacity-[0.05]">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        {/* Clipboard */}
        <div className="float-3 absolute bottom-[20%] left-[15%] opacity-[0.05]">
          <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5">
            <path d="M15 2H9a1 1 0 0 0-1 1v2h8V3a1 1 0 0 0-1-1Z" />
            <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
            <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
          </svg>
        </div>
        {/* Shield */}
        <div className="float-1 absolute bottom-[25%] right-[10%] opacity-[0.05]" style={{ animationDelay: '-3s' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        {/* Sparkle */}
        <div className="float-2 absolute top-[60%] left-[50%] opacity-[0.05]" style={{ animationDelay: '-5s' }}>
          <svg width="50" height="50" viewBox="0 0 32 32" fill="none">
            <path d="M16 2 L19 12 L16 22 L13 12 Z" fill="#D97706" />
            <path d="M6 12 L13 9 L26 12 L19 15 Z" fill="#D97706" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 text-center px-6">
        {/* Headline */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={spring}
          style={{ fontFamily: '"Newsreader", serif', color: '#2D2D3A' }}
          className="text-3xl md:text-5xl lg:text-6xl mb-10 md:mb-14"
        >
          Experience Dr. Claudeis
        </motion.h2>

        {/* Buttons */}
        <motion.div
          variants={cardStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-10 md:mb-14"
        >
          <motion.button
            variants={cardVariant}
            onClick={() => onSelectRole?.('patient')}
            className="w-64 md:w-72 py-4 md:py-5 px-8 text-white font-semibold text-lg md:text-xl rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: '"Inter", sans-serif',
              background: '#D97706',
              boxShadow: '0 8px 30px rgba(217,119,6,0.3)',
            }}
          >
            I&rsquo;m a Patient
          </motion.button>

          <motion.button
            variants={cardVariant}
            onClick={() => onSelectRole?.('doctor')}
            className="w-64 md:w-72 py-4 md:py-5 px-8 font-semibold text-lg md:text-xl rounded-full hover:scale-105 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: '"Inter", sans-serif',
              color: '#D97706',
              background: 'transparent',
              border: '2px solid #D97706',
            }}
          >
            I&rsquo;m a Doctor
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.p
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          style={{ fontFamily: '"Inter", sans-serif', color: '#8B8B9E' }}
          className="text-sm"
        >
          Built with Claude AI at UW Waterloo · 2026
        </motion.p>
      </div>
    </section>
  )
}

// ============================================================
// MAIN LANDING PAGE
// ============================================================
export default function LandingPage({ onSelectRole }) {
  return (
    <div className="snap-container">
      <HookSection />
      <MapSection />
      <DoctorsMathSection />
      <MeetSection />
      <HowItWorksSection />
      <PromiseSection />
      <CTASection onSelectRole={onSelectRole} />
    </div>
  )
}
