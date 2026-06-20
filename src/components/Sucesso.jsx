import { CheckCircle, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react'
import { Button } from './ui/Button'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function Sucesso({ pedido, valorTotal, offline, onNovoPedido, onTrocarAtendente }) {
  const totalItens = pedido.itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <div className="min-h-screen bg-surface flex flex-col step-transicao">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Ícone animado */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            viewBox="0 0 52 52"
            className="w-12 h-12"
            fill="none"
          >
            <circle cx="26" cy="26" r="25" stroke="#22C55E" strokeWidth="2" />
            <path
              d="M14 27l8 8 16-16"
              stroke="#22C55E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-animado"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Pedido registrado com sucesso!
        </h1>

        {offline && (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4 w-full max-w-sm">
            <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Pedido salvo localmente. Será sincronizado quando a conexão retornar.
            </p>
          </div>
        )}

        {/* Resumo compacto */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm w-full max-w-sm mt-6 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Resumo</h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cliente</span>
              <span className="font-medium text-gray-800 text-right ml-4 truncate max-w-[180px]">
                {pedido.cliente?.razaoSocial}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Atendente</span>
              <span className="font-medium text-gray-800">{pedido.atendente?.nome}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Itens</span>
              <span className="font-medium text-gray-800">{totalItens} {totalItens === 1 ? 'unidade' : 'unidades'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-lg font-bold text-primary">{formatarMoeda(valorTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="px-4 pb-8 pt-2 flex flex-col gap-3">
        <Button
          larguraTotal
          onClick={onNovoPedido}
          className="h-14 text-base"
        >
          <RefreshCw size={18} />
          Registrar novo pedido
        </Button>
        <Button
          variante="secondary"
          larguraTotal
          onClick={onTrocarAtendente}
          className="h-12 text-sm"
        >
          <UserCheck size={16} />
          Trocar atendente
        </Button>
      </div>
    </div>
  )
}
