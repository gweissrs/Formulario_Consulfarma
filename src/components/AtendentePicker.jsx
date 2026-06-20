import { useState } from 'react'
import { User } from 'lucide-react'
import { Input } from './ui/Input'

const ATENDENTES_FIXOS = [
  'Thiago',
  'Leila',
  'Flavia',
  'Francine',
  'Edna',
  'Jean',
  'Auto Atendimento',
]

export function AtendentePicker({ onConfirmar }) {
  const [selecionado, setSelecionado] = useState(null)
  const [mostrarOutro, setMostrarOutro] = useState(false)
  const [nomeOutro, setNomeOutro] = useState('')

  function handleSelecionar(nome) {
    if (nome === 'Outro') {
      setMostrarOutro(true)
      setSelecionado('Outro')
    } else {
      setMostrarOutro(false)
      setNomeOutro('')
      setSelecionado(nome)
    }
  }

  function handleConfirmar() {
    const nomeAtendente = selecionado === 'Outro' ? nomeOutro.trim() : selecionado
    if (!nomeAtendente) return
    onConfirmar({ id: nomeAtendente.toLowerCase(), nome: nomeAtendente })
  }

  const atendenteBotaoHabilitado =
    selecionado !== null &&
    (selecionado !== 'Outro' || nomeOutro.trim().length > 0)

  return (
    <div className="min-h-screen bg-bg flex flex-col step-transicao pt-[59px]">
      <div className="flex-1 px-4 py-6 flex flex-col">
        <h1 className="font-display text-[26px] font-bold text-gray-900 mb-1">
          Quem está atendendo?
        </h1>
        <p className="text-[14px] text-gray-400 mb-6">
          Selecione seu nome para registrar o pedido corretamente.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {ATENDENTES_FIXOS.map(nome => {
            const ativo = selecionado === nome
            return (
              <button
                key={nome}
                onClick={() => handleSelecionar(nome)}
                className={`
                  flex items-center gap-2 px-3 py-3 rounded-xl min-h-[52px]
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

          <button
            onClick={() => handleSelecionar('Outro')}
            className={`
              flex items-center gap-2 px-3 py-3 rounded-xl min-h-[52px]
              border-[1.5px] transition-all duration-150 text-left
              ${selecionado === 'Outro'
                ? 'border-primary bg-red-50'
                : 'border-border bg-surface hover:border-gray-300'
              }
            `}
          >
            <User size={20} className={selecionado === 'Outro' ? 'text-primary' : 'text-gray-400'} />
            <span className={`text-[14px] font-medium ${selecionado === 'Outro' ? 'text-primary' : 'text-gray-900'}`}>
              Outro atendente
            </span>
          </button>
        </div>

        {mostrarOutro && (
          <div className="mt-4 slide-down">
            <Input
              label="Digite seu nome"
              value={nomeOutro}
              onChange={e => setNomeOutro(e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
            />
          </div>
        )}
      </div>

      <div className="px-4 pb-8 pt-2">
        <button
          onClick={handleConfirmar}
          disabled={!atendenteBotaoHabilitado}
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
