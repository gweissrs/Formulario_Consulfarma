import { supabase } from './supabase'

const STORAGE_KEY = 'coana_pedidos_pendentes'
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function salvarPedidoLocal(pedido) {
  const pendentes = getPedidosPendentes()
  pendentes.push({ ...pedido, timestamp: Date.now() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendentes))
}

export function getPedidosPendentes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function removerPedidoLocal(timestamp) {
  const pendentes = getPedidosPendentes().filter(p => p.timestamp !== timestamp)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendentes))
}

export function limparPedidosPendentes() {
  localStorage.removeItem(STORAGE_KEY)
}

let _syncEmAndamento = false

export async function syncPedidosPendentes() {
  if (_syncEmAndamento) return { sincronizados: 0, pendentes: getPedidosPendentes().length }
  _syncEmAndamento = true

  const pendentes = getPedidosPendentes()
  if (pendentes.length === 0) {
    _syncEmAndamento = false
    return { sincronizados: 0, pendentes: 0 }
  }

  let sincronizados = 0

  for (const pedido of pendentes) {
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

      let atendenteId = pedido.atendente.id
      if (!UUID_REGEX.test(atendenteId)) {
        const { data: existente } = await supabase
          .from('atendentes')
          .select('id')
          .eq('nome', pedido.atendente.nome)
          .maybeSingle()
        if (existente) {
          atendenteId = existente.id
        } else {
          atendenteId = crypto.randomUUID()
          const { error: atendenteError } = await supabase
            .from('atendentes')
            .insert({ id: atendenteId, nome: pedido.atendente.nome })
          if (atendenteError) throw atendenteError
        }
      }

      const pedidoId = crypto.randomUUID()
      const { error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          id: pedidoId,
          cliente_id: clienteId,
          atendente_id: atendenteId,
          valor_total: pedido.valorTotal,
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

      removerPedidoLocal(pedido.timestamp)
      sincronizados++
    } catch (err) {
      console.error('[sync] falha ao sincronizar pedido:', err)
      _syncEmAndamento = false
      break
    }
  }

  _syncEmAndamento = false
  return { sincronizados, pendentes: getPedidosPendentes().length }
}
