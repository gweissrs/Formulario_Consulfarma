import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { salvarPedidoLocal } from '../lib/offline'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function Checkout({ pedido, valorTotal, onRemoverItem, onAdicionarItem, onSucesso }) {
  const [enviando, setEnviando] = useState(false)

  function atualizarQuantidade(produto, novaQtd) {
    const qtd = Math.max(1, parseInt(novaQtd) || 1)
    onAdicionarItem(produto, qtd)
  }

  async function handleEnviar() {
    setEnviando(true)

    const payloadPedido = {
      atendente: pedido.atendente,
      cliente: pedido.cliente,
      itens: pedido.itens,
      valorTotal,
      criadoEm: new Date().toISOString(),
    }

    try {
      const clienteId = crypto.randomUUID()
      const { error: clienteError } = await supabase
        .from('clientes')
        .insert({
          id: clienteId,
          razao_social: pedido.cliente.razaoSocial,
          cnpj: pedido.cliente.cnpj,
          email: pedido.cliente.email,
          whatsapp: pedido.cliente.whatsapp,
        })

      if (clienteError) throw clienteError

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      let atendenteId = pedido.atendente.id

      if (!uuidRegex.test(atendenteId)) {
        atendenteId = crypto.randomUUID()
        const { error: atendenteError } = await supabase
          .from('atendentes')
          .insert({ id: atendenteId, nome: pedido.atendente.nome })
        if (atendenteError) throw atendenteError
      }

      const pedidoId = crypto.randomUUID()
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          id: pedidoId,
          cliente_id: clienteId,
          atendente_id: atendenteId,
          valor_total: valorTotal,
          status: 'pendente',
        })

      if (pedidoError) throw pedidoError

      const itens = pedido.itens.map(item => ({
        pedido_id: pedidoId,
        codigo_produto: item.produto.codigo,
        nome_produto: item.produto.nome,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco_env,
        subtotal: item.produto.preco_env * item.quantidade,
      }))

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itens)

      if (itensError) throw itensError

      try {
        await supabase.functions.invoke('notify-pedido', {
          body: { ...payloadPedido, pedidoId },
        })
      } catch {
        // Falha no email não bloqueia o fluxo
      }

      onSucesso({ offline: false })
    } catch (err) {
      console.error('Erro ao enviar pedido:', err)
      salvarPedidoLocal(payloadPedido)
      onSucesso({ offline: !navigator.onLine })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col step-transicao pt-[59px]">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-5">
        <div>
          <h1 className="font-sans text-[26px] font-bold text-gray-900 mb-1">
            Revisão do Pedido
          </h1>
          <p className="text-[14px] text-gray-400">
            Confirme os itens antes de enviar.
          </p>
        </div>

        {/* Cliente */}
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.08em] mb-2">
            Cliente
          </p>
          <div className="bg-surface rounded-xl p-4 border border-border shadow-card">
            <p className="text-[14px] font-semibold text-gray-900">{pedido.cliente?.razaoSocial}</p>
            <p className="text-[13px] text-gray-500 mt-0.5">{pedido.cliente?.cnpjFormatado}</p>
            <p className="text-[13px] text-gray-500">{pedido.cliente?.email}</p>
            <p className="text-[13px] text-gray-500">{pedido.cliente?.whatsappFormatado}</p>
          </div>
        </div>

        {/* Produtos selecionados */}
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.08em] mb-2">
            Produtos Selecionados
          </p>
          <div className="flex flex-col gap-2">
            {pedido.itens.map(({ produto, quantidade }) => {
              const subtotal = produto.preco_env * quantidade
              return (
                <div key={produto.id} className="bg-surface rounded-xl p-4 border border-border shadow-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-[13px] font-medium text-gray-900 leading-tight flex-1">
                      {produto.nome}
                    </p>
                    <p className="text-[14px] font-semibold text-gray-900 flex-shrink-0">
                      {formatarMoeda(subtotal)}
                    </p>
                  </div>
                  {produto.desconto && (
                    <p className="text-[12px] mb-2" style={{ color: '#16A34A' }}>
                      Desconto de 10% aplicado — economia de {formatarMoeda((produto.preco_original - produto.preco_env) * quantidade)}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-[7px] py-[2px] rounded bg-gray-100 text-[11px] font-semibold text-gray-500">
                        {produto.codigo}
                      </span>
                      <div className="flex items-center gap-1 border border-border rounded px-1">
                        <button
                          onClick={() => atualizarQuantidade(produto, quantidade - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={quantidade}
                          min={1}
                          onChange={e => atualizarQuantidade(produto, e.target.value)}
                          className="w-12 text-center text-[13px] font-semibold text-gray-900 border-none bg-transparent focus:outline-none py-1"
                        />
                        <button
                          onClick={() => atualizarQuantidade(produto, quantidade + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoverItem(produto.id)}
                      className="text-gray-400 hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Total */}
        <div className="bg-[#FDF5F5] border border-accent rounded-xl p-4">
          {(() => {
            const economiaTotal = pedido.itens
              .filter(({ produto }) => produto.desconto)
              .reduce((acc, { produto, quantidade }) => acc + (produto.preco_original - produto.preco_env) * quantidade, 0)
            return economiaTotal > 0 ? (
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-accent/30">
                <span className="text-[12px] text-gray-700">Economia total na feira:</span>
                <span className="text-[13px] font-semibold" style={{ color: '#16A34A' }}>{formatarMoeda(economiaTotal)}</span>
              </div>
            ) : null
          })()}
          <p className="text-[13px] text-gray-700 mb-1">Valor estimado do pedido</p>
          <p className="font-sans text-[32px] font-bold text-primary leading-none">
            {formatarMoeda(valorTotal)}
          </p>
          <p className="text-[11px] text-gray-400 mt-2">
            * Sujeito a confirmação comercial
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 pb-8 pt-2">
        <button
          onClick={handleEnviar}
          disabled={enviando || pedido.itens.length === 0}
          className={`
            w-full h-[52px] rounded-xl font-semibold text-[15px] text-white
            bg-primary transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-primary-hover active:bg-primary-dark
            flex items-center justify-center gap-2
          `}
        >
          {enviando ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar pedido'
          )}
        </button>
      </div>
    </div>
  )
}
