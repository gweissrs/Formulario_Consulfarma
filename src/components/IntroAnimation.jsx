import { useState, useEffect } from 'react'

export function IntroAnimation({ onComplete }) {
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    const timerSaida = setTimeout(() => setSaindo(true), 2400)
    const timerCompleto = setTimeout(() => onComplete(), 2800)
    return () => {
      clearTimeout(timerSaida)
      clearTimeout(timerCompleto)
    }
  }, [onComplete])

  return (
    <div
      className={`absolute inset-0 bg-bg flex flex-col items-center justify-center z-50 ${saindo ? 'intro-saindo' : ''}`}
    >
      <div className="intro-logo flex flex-col items-center">
        <img
          src="/favicon.png"
          alt="COANA"
          className="w-[120px] h-[120px] object-contain"
          onError={e => { e.target.style.display = 'none' }}
        />
        <h1
          className="font-sans text-center text-primary"
          style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '20px' }}
        >
          COANA Probióticos
        </h1>
        <p
          className="font-sans text-center uppercase text-gray-400"
          style={{ fontSize: '11px', fontWeight: 300, letterSpacing: '0.22em', marginTop: '10px' }}
        >
          CONSULFARMA 2026
        </p>
      </div>
    </div>
  )
}
