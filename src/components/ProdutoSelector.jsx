import { useState } from 'react'
import { Search, Plus, Minus } from 'lucide-react'
import { PRODUTOS } from '../constants/produtos'

export function ProdutoSelector({ itens, onAdicionarItem, onVerCarrinho }) {
  const [busca, setBusca] = useState('')
  const [produtoExpandido, setProdutoExpandido] = useState(null)
  const [quantidade, setQuantidade] = useState(1)

  const produtosFiltrados = PRODUTOS.filter(p => {
    const termo = busca.toLowerCase()
    return (
      p.nome.toLowerCase().includes(termo) ||
      p.codigo.toLowerCase().includes(termo)
    )
  })

  function getQuantidadeNoCarrinho(produtoId) {
    const item = itens.find(i => i.produto.id === produtoId)
    return item?.quantidade || 0
  }

  function handleAbrirExpandido(produto) {
    if (produtoExpandido?.id === produto.id) {
      setProdutoExpandido(null)
    } else {
      if (produtoExpandido) {
        onAdicionarItem(produtoExpandido, quantidade)
      }
      setProdutoExpandido(produto)
      setQuantidade(getQuantidadeNoCarrinho(produto.id) || 1)
    }
  }

  function handleConfirmarQuantidade() {
    onAdicionarItem(produtoExpandido, quantidade)
    setProdutoExpandido(null)
  }

  function ajustar(delta) {
    setQuantidade(prev => Math.max(1, prev + delta))
  }

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)
  const totalValor = itens.reduce((acc, i) => acc + i.produto.preco_env * i.quantidade, 0)
  const totalFormatado = totalValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="min-h-screen bg-bg flex flex-col step-transicao pt-[59px]">
      <div className="w-full max-w-2xl mx-auto px-4 pt-5 pb-3">
        <h1 className="font-sans text-[26px] font-bold text-gray-900 mb-1">
          Produtos de Interesse
        </h1>
        <p className="text-[14px] text-gray-400 mb-4">
          Selecione os probióticos e informe a quantidade desejada.
        </p>
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full pl-10 pr-4 py-[11px] rounded-xl border-[1.5px] border-border bg-surface text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors duration-150"
          />
        </div>
      </div>

      <div className={`flex-1 w-full max-w-2xl mx-auto px-4 py-3 flex flex-col gap-3 ${totalItens > 0 ? 'pb-36' : 'pb-20'}`}>
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-[15px] font-medium">Nenhum produto encontrado</p>
            <p className="text-[13px] mt-1">Tente outro termo de busca</p>
          </div>
        ) : (
          produtosFiltrados.map(produto => {
            const qtdCarrinho = getQuantidadeNoCarrinho(produto.id)
            const semPreco = !produto.preco_env
            const expandido = produtoExpandido?.id === produto.id

            return (
              <div key={produto.id}>
                <button
                  onClick={() => !semPreco && handleAbrirExpandido(produto)}
                  disabled={semPreco}
                  className={`
                    w-full bg-surface rounded-xl border-[1.5px] p-[14px] text-left
                    transition-all duration-150
                    ${semPreco
                      ? 'border-border opacity-45 cursor-not-allowed'
                      : qtdCarrinho > 0 || expandido
                      ? 'border-primary'
                      : 'border-border hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-[7px] py-[2px] rounded bg-gray-100 text-[11px] font-semibold text-gray-500 flex-shrink-0">
                          {produto.codigo}
                        </span>
                        {produto.desconto && (
                          <span className="inline-flex items-center px-[7px] py-[2px] rounded text-[11px] font-semibold text-white flex-shrink-0" style={{ backgroundColor: '#F5A800' }}>
                            10% OFF
                          </span>
                        )}
                        {semPreco && (
                          <span className="inline-flex items-center px-[7px] py-[2px] rounded bg-gray-100 text-[11px] text-gray-400">
                            Indisponível
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-gray-900 leading-[1.4] line-clamp-2">
                        {produto.nome}
                      </p>
                    </div>
                    {qtdCarrinho > 0 && (
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-[2px] rounded-full bg-primary text-[11px] font-semibold text-white">
                        {qtdCarrinho}x
                      </span>
                    )}
                  </div>

                  {!semPreco && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                      <span className="text-[12px] font-semibold" style={{ color: '#374151' }}>
                        {produto.preco_g.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        <span className="text-[11px] font-normal" style={{ color: '#9CA3AF' }}> /g</span>
                      </span>
                      <span className="text-[12px]" style={{ color: '#D1D5DB' }}>·</span>
                      <span className="text-[13px] font-semibold" style={{ color: '#111827' }}>
                        {produto.preco_env.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        <span className="text-[11px] font-normal" style={{ color: '#9CA3AF' }}> /env</span>
                      </span>
                    </div>
                  )}
                </button>

                {expandido && (
                  <div className="bg-surface border border-border rounded-xl mt-1 p-4 shadow-card-elevated slide-down">
                    <p className="text-[13px] font-medium text-gray-700 mb-3">
                      Quantos envelopes?
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <button
                        onClick={() => ajustar(-1)}
                        className="w-10 h-10 rounded-full border-[1.5px] border-primary flex items-center justify-center text-primary"
                      >
                        <Minus size={18} />
                      </button>
                      <input
                        type="number"
                        value={quantidade}
                        min={1}
                        onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center text-[20px] font-semibold text-gray-900 border-b-2 border-primary bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => ajustar(1)}
                        className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      onClick={handleConfirmarQuantidade}
                      className="w-full h-10 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary-hover transition-colors duration-150"
                    >
                      Adicionar ao pedido
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {totalItens > 0 && (
        <div className="fixed-bottom-bar bg-surface border-t border-border">
          <div className="max-w-2xl mx-auto px-4 pb-16 pt-3">
            <button
              onClick={onVerCarrinho}
              className="w-full h-[52px] rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary-hover transition-colors duration-150"
            >
              Revisar pedido · {totalItens} {totalItens === 1 ? 'produto' : 'produtos'} · {totalFormatado}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
