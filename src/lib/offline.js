const STORAGE_KEY = 'coana_pedidos_pendentes'

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
