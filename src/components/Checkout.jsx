import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { salvarPedidoLocal, removerPedidoLocal } from '../lib/offline'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function Checkout({ pedido, valorTotal, onRemoverItem, onAdicionarItem, onVoltar, onSucesso }) {
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

    // Buffer offline: salvar localmente antes de qualquer tentativa de rede
    salvarPedidoLocal(payloadPedido)

    let pedidoOffline = false
    let timestampLocal = payloadPedido.timestamp

    try {
      // 1. Inserir cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          razao_social: pedido.cliente.razaoSocial,
          cnpj: pedido.cliente.cnpj,
          email: pedido.cliente.email,
          whatsapp: pedido.cliente.whatsapp,
        })
        .select('id')
        .single()

      if (clienteError) throw clienteError

      // 2. Resolver atendente — se for "Outro", inserir no banco primeiro
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      let atendenteId = pedido.atendente.id

      if (!uuidRegex.test(atendenteId)) {
        const { data: atendenteData, error: atendenteError } = await supabase
          .from('atendentes')
          .insert({ nome: pedido.atendente.nome })
          .select('id')
          .single()
        if (atendenteError) throw atendenteError
        atendenteId = atendenteData.id
      }

      // 3. Inserir pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: clienteData.id,
          atendente_id: atendenteId,
          valor_total: valorTotal,
          status: 'pendente',
        })
        .select('id')
        .single()

      if (pedidoError) throw pedidoError

      // 3. Inserir itens
      const itens = pedido.itens.map(item => ({
        pedido_id: pedidoData.id,
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco_env,
        subtotal: item.produto.preco_env * item.quantidade,
      }))

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itens)

      if (itensError) throw itensError

      // 4. Notificar por email via Edge Function
      try {
        await supabase.functions.invoke('notify-pedido', {
          body: { ...payloadPedido, pedidoId: pedidoData.id },
        })
      } catch {
        // Falha no email não bloqueia o fluxo
      }

      // 5. Pedido salvo com sucesso: remover do buffer local
      removerPedidoLocal(timestampLocal)

      onSucesso({ offline: false })
    } catch (err) {
      console.error('Erro ao enviar pedido:', err)
      pedidoOffline = true
      toast('Pedido salvo localmente. Será sincronizado quando a conexão retornar.', {
        icon: '⚠️',
        style: { background: '#FEF3C7', color: '#92400E' },
        duration: 5000,
      })
      onSucesso({ offline: true })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col step-transicao">
      <div className="bg-primary px-4 pt-12 pb-6">
        <button
          onClick={onVoltar}
          className="flex items-center gap-1 text-red-200 mb-3 text-sm"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        <h1 className="text-white text-2xl font-bold">Revisão do Pedido</h1>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-4">
        {/* Itens */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Produtos ({pedido.itens.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pedido.itens.map(({ produto, quantidade }) => (
              <Card key={produto.id} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">{produto.codigo}</p>
                  <p className="text-sm font-medium text-gray-800 leading-tight truncate">
                    {produto.nome}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    R$ {produto.preco_env?.toFixed(2)} × {quantidade} ={' '}
                    <span className="font-semibold text-primary">
                      {formatarMoeda(produto.preco_env * quantidade)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input
                    type="number"
                    value={quantidade}
                    min={1}
                    onChange={e => atualizarQuantidade(produto, e.target.value)}
                    className="w-14 text-center text-sm font-bold border border-gray-200 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => onRemoverItem(produto.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Resumo do cliente */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Cliente</h2>
          <Card>
            <p className="font-semibold text-gray-800">{pedido.cliente?.razaoSocial}</p>
            <p className="text-sm text-gray-500 mt-0.5">{pedido.cliente?.cnpjFormatado}</p>
            <p className="text-sm text-gray-500">{pedido.cliente?.email}</p>
            <p className="text-sm text-gray-500">{pedido.cliente?.whatsappFormatado}</p>
          </Card>
        </div>

        {/* Atendente */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Atendente</h2>
          <Card>
            <p className="font-semibold text-gray-800">{pedido.atendente?.nome}</p>
          </Card>
        </div>

        {/* Total */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-medium">Valor Total</span>
            <span className="text-2xl font-bold text-primary">
              {formatarMoeda(valorTotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-2">
        <Button
          larguraTotal
          loading={enviando}
          disabled={pedido.itens.length === 0}
          onClick={handleEnviar}
          className="h-14 text-base"
        >
          {enviando ? 'Enviando pedido...' : 'Enviar Pedido'}
        </Button>
      </div>
    </div>
  )
}
