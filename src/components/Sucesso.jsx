import { Check, WifiOff } from 'lucide-react'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function Sucesso({ pedido, valorTotal, offline, onNovoPedido, onTrocarAtendente }) {
  const totalItens = pedido.itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <div className="min-h-screen bg-bg flex flex-col step-transicao">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6 check-pop"
          style={{ backgroundColor: '#16A34A' }}
        >
          <Check size={32} color="white" strokeWidth={2.5} />
        </div>

        <h1 className="font-display text-[28px] font-bold text-gray-900 text-center mb-2">
          Pedido registrado!
        </h1>
        <p className="text-[14px] text-gray-400 text-center">
          Nossa equipe entrará em contato em breve.
        </p>

        {offline && (
          <div className="flex items-start gap-3 mt-5 w-full max-w-sm bg-[#FFF8E1] border border-accent rounded-xl p-3">
            <WifiOff size={18} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-gray-700">
              Pedido salvo localmente. Será enviado automaticamente quando a conexão retornar.
            </p>
          </div>
        )}

        <div className="bg-surface rounded-xl border border-border shadow-card w-full max-w-sm mt-5 p-4">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.08em] mb-3">
            Resumo
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Atendente</span>
              <span className="font-medium text-gray-900">{pedido.atendente?.nome}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Cliente</span>
              <span className="font-medium text-gray-900 text-right ml-4 truncate max-w-[180px]">
                {pedido.cliente?.razaoSocial}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Produtos</span>
              <span className="font-medium text-gray-900">
                {totalItens} {totalItens === 1 ? 'unidade' : 'unidades'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border mt-1">
              <span className="text-[13px] text-gray-600">Total estimado</span>
              <span className="text-[17px] font-bold text-primary">{formatarMoeda(valorTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-2 flex flex-col gap-3">
        <button
          onClick={onNovoPedido}
          className="w-full h-[52px] rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary-hover transition-colors duration-150"
        >
          Novo pedido com mesmo atendente
        </button>
        <button
          onClick={onTrocarAtendente}
          className="w-full h-12 rounded-xl bg-surface border-[1.5px] border-primary text-primary font-medium text-[14px] hover:bg-red-50 transition-colors duration-150"
        >
          Trocar atendente
        </button>
      </div>
    </div>
  )
}
