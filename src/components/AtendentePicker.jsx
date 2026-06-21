import { useState } from 'react'
import { User } from 'lucide-react'

const ATENDENTES = [
  'Thiago',
  'Leila',
  'Flavia',
  'Francine',
  'Edna',
  'Jean',
  'Auto Atendimento',
  'Outro atendente',
]

export function AtendentePicker({ onConfirmar }) {
  const [selecionado, setSelecionado] = useState(null)

  function handleConfirmar() {
    if (!selecionado) return
    onConfirmar({ id: selecionado.toLowerCase().replace(/\s+/g, '-'), nome: selecionado })
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col step-transicao pt-[59px]">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 flex flex-col">
        <h1 className="font-sans text-[26px] font-bold text-gray-900 mb-1">
          Quem está atendendo?
        </h1>
        <p className="text-[14px] text-gray-400 mb-6">
          Selecione seu nome para registrar o pedido corretamente.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ATENDENTES.map(nome => {
            const ativo = selecionado === nome
            return (
              <button
                key={nome}
                onClick={() => setSelecionado(nome)}
                className={`
                  w-full flex items-center gap-2 px-3 py-3 rounded-xl min-h-[52px]
                  border-[1.5px] transition-all duration-150 text-left
                  ${ativo
                    ? 'border-primary bg-red-50'
                    : 'border-border bg-surface hover:border-gray-300'
                  }
                `}
              >
                <User size={20} className={ativo ? 'text-primary' : 'text-gray-400'} />
                <span className={`text-[14px] font-medium ${ativo ? 'text-primary' : 'text-gray-900'}`}>
                  {nome}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 pb-8 pt-2">
        <button
          onClick={handleConfirmar}
          disabled={!selecionado}
          className={`
            w-full h-[52px] rounded-xl font-semibold text-[15px] text-white
            bg-primary transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-primary-hover active:bg-primary-dark
          `}
        >
          Confirmar e continuar →
        </button>
      </div>
    </div>
  )
}
