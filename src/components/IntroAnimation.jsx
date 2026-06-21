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
          className="text-center"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#8B2020', letterSpacing: '0.02em', marginTop: '20px' }}
        >
          COANA
        </h1>
        <p
          className="font-sans text-center"
          style={{ fontSize: '13px', fontWeight: 400, color: '#8B2020', letterSpacing: '0.01em', marginTop: '4px' }}
        >
          Soluções em Probióticos
        </p>
        <p
          className="font-sans text-center uppercase"
          style={{ fontSize: '11px', fontWeight: 300, color: '#9CA3AF', letterSpacing: '0.22em', marginTop: '12px' }}
        >
          CONSULFARMA 2026
        </p>
      </div>
    </div>
  )
}
