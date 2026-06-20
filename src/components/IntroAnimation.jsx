import { useState, useEffect } from 'react'

export function IntroAnimation({ onComplete }) {
  const [saindo, setSaindo] = useState(false)

  useEffect(() => {
    const timerSaida = setTimeout(() => setSaindo(true), 2100)
    const timerCompleto = setTimeout(() => onComplete(), 2500)

    return () => {
      clearTimeout(timerSaida)
      clearTimeout(timerCompleto)
    }
  }, [onComplete])

  return (
    <div
      className={`
        fixed inset-0 bg-surface flex flex-col items-center justify-center z-50
        ${saindo ? 'intro-saindo' : ''}
      `}
    >
      <div className="intro-logo">
        <img
          src="/logo.webp"
          alt="COANA Consulfarma"
          className="w-48 h-auto object-contain"
          onError={e => {
            e.target.style.display = 'none'
          }}
        />
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold text-primary tracking-tight">COANA</h1>
          <p className="text-sm text-gray-500 mt-1">Consulfarma 2026</p>
        </div>
      </div>
    </div>
  )
}
