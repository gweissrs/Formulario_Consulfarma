import { ChevronLeft } from 'lucide-react'

const NOMES_STEPS = {
  1: 'Identificação do Atendente',
  2: 'Dados do Cliente',
  3: 'Seleção de Produtos',
  4: 'Revisão do Pedido',
}

export function ProgressBar({ step, onVoltar }) {
  const progresso = (step / 4) * 100

  return (
    <div className="fixed top-0 left-0 right-0 z-30">
      <div
        className="bg-surface border-b border-border h-14 flex items-center px-4"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="w-1/4 flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="COANA"
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          {step > 1 && onVoltar && (
            <button
              onClick={onVoltar}
              className="flex items-center gap-0.5 text-gray-700 text-sm"
            >
              <ChevronLeft size={18} />
              Voltar
            </button>
          )}
        </div>

        <div className="flex-1 text-center">
          <span className="font-semibold text-[15px] text-gray-900">
            {NOMES_STEPS[step]}
          </span>
        </div>

        <div className="w-1/4 text-right">
          <span className="text-[13px] text-gray-400">Etapa {step} de 4</span>
        </div>
      </div>

      <div className="h-[2px] bg-gray-200">
        <div
          className="h-full bg-primary"
          style={{
            width: `${progresso}%`,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
