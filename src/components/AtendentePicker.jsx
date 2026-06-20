import { useState } from 'react'
import { User } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

const ATENDENTES_FIXOS = [
  'Thiago',
  'Leila',
  'Flavia',
  'Francine',
  'Edna',
  'Jean',
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
    <div className="min-h-screen bg-surface flex flex-col step-transicao">
      <div className="bg-primary px-4 pt-12 pb-6">
        <h1 className="text-white text-2xl font-bold">Quem está atendendo?</h1>
        <p className="text-red-200 text-sm mt-1">Selecione seu nome para começar</p>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {ATENDENTES_FIXOS.map(nome => (
            <Card
              key={nome}
              selecionado={selecionado === nome}
              onClick={() => handleSelecionar(nome)}
              className="flex items-center gap-3 min-h-[56px]"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selecionado === nome ? 'bg-primary' : 'bg-gray-100'
                }`}
              >
                <User
                  size={18}
                  className={selecionado === nome ? 'text-white' : 'text-gray-500'}
                />
              </div>
              <span
                className={`font-semibold text-sm ${
                  selecionado === nome ? 'text-primary' : 'text-gray-800'
                }`}
              >
                {nome}
              </span>
            </Card>
          ))}

          <Card
            selecionado={selecionado === 'Outro'}
            onClick={() => handleSelecionar('Outro')}
            className="flex items-center gap-3 min-h-[56px]"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                selecionado === 'Outro' ? 'bg-accent' : 'bg-gray-100'
              }`}
            >
              <User
                size={18}
                className={selecionado === 'Outro' ? 'text-white' : 'text-gray-500'}
              />
            </div>
            <span
              className={`font-semibold text-sm ${
                selecionado === 'Outro' ? 'text-gray-800' : 'text-gray-800'
              }`}
            >
              Outro
            </span>
          </Card>
        </div>

        {mostrarOutro && (
          <div className="mt-4">
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
        <Button
          larguraTotal
          disabled={!atendenteBotaoHabilitado}
          onClick={handleConfirmar}
          className="h-14 text-base"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
