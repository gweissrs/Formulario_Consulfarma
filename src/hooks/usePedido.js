import { useState } from 'react'

const estadoInicial = {
  atendente: null,
  cliente: null,
  itens: [],
}

export function usePedido() {
  const [pedido, setPedido] = useState(estadoInicial)

  function setAtendente(atendente) {
    setPedido(prev => ({ ...prev, atendente }))
  }

  function setCliente(cliente) {
    setPedido(prev => ({ ...prev, cliente }))
  }

  function adicionarItem(produto, quantidade) {
    setPedido(prev => {
      const existente = prev.itens.find(i => i.produto.id === produto.id)
      if (existente) {
        return {
          ...prev,
          itens: prev.itens.map(i =>
            i.produto.id === produto.id ? { ...i, quantidade } : i
          ),
        }
      }
      return { ...prev, itens: [...prev.itens, { produto, quantidade }] }
    })
  }

  function removerItem(produtoId) {
    setPedido(prev => ({
      ...prev,
      itens: prev.itens.filter(i => i.produto.id !== produtoId),
    }))
  }

  function resetar() {
    setPedido(estadoInicial)
  }

  function resetarMantendoAtendente() {
    setPedido(prev => ({ ...estadoInicial, atendente: prev.atendente }))
  }

  const valorTotal = pedido.itens.reduce(
    (acc, item) => acc + (item.produto.preco_env || 0) * item.quantidade,
    0
  )

  return {
    pedido,
    setAtendente,
    setCliente,
    adicionarItem,
    removerItem,
    resetar,
    resetarMantendoAtendente,
    valorTotal,
  }
}
