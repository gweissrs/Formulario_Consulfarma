import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'

function SkeletonProduto() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-16 h-4 bg-gray-200 rounded" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
      <div className="flex gap-4 mt-3">
        <div className="h-5 bg-gray-200 rounded w-20" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
    </div>
  )
}

function ModalQuantidade({ produto, quantidadeAtual, onConfirmar, onFechar }) {
  const [quantidade, setQuantidade] = useState(quantidadeAtual || 1)

  function ajustar(delta) {
    setQuantidade(prev => Math.max(1, prev + delta))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <Badge variante="default" className="mb-2">{produto.codigo}</Badge>
            <h3 className="text-sm font-semibold text-gray-800 leading-tight">{produto.nome}</h3>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        {produto.preco_env && (
          <p className="text-sm text-gray-500 mb-4">
            Preço/env: <span className="font-bold text-primary">R$ {produto.preco_env.toFixed(2)}</span>
          </p>
        )}

        <div className="flex items-center justify-center gap-6 my-6">
          <button
            onClick={() => ajustar(-1)}
            className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-primary"
          >
            <Minus size={20} />
          </button>
          <input
            type="number"
            value={quantidade}
            min={1}
            onChange={e => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center text-2xl font-bold text-gray-800 border-b-2 border-primary bg-transparent focus:outline-none"
          />
          <button
            onClick={() => ajustar(1)}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white"
          >
            <Plus size={20} />
          </button>
        </div>

        <Button
          larguraTotal
          onClick={() => onConfirmar(quantidade)}
          className="h-12"
        >
          Adicionar ao pedido
        </Button>
      </div>
    </div>
  )
}

export function ProdutoSelector({ itens, onAdicionarItem, onVerCarrinho }) {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [produtoModal, setProdutoModal] = useState(null)

  useEffect(() => {
    async function buscarProdutos() {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('nome')

        if (error) throw error
        setProdutos(data || [])
      } catch (err) {
        console.error('Erro ao buscar produtos:', err)
        setProdutos([])
      } finally {
        setCarregando(false)
      }
    }

    buscarProdutos()
  }, [])

  const produtosFiltrados = produtos.filter(p => {
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

  function handleConfirmarQuantidade(quantidade) {
    onAdicionarItem(produtoModal, quantidade)
    setProdutoModal(null)
  }

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <div className="min-h-screen bg-surface flex flex-col step-transicao">
      <div className="bg-primary px-4 pt-12 pb-4 sticky top-0 z-10">
        <h1 className="text-white text-xl font-bold mb-3">Selecionar Produtos</h1>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 pb-28 flex flex-col gap-3">
        {carregando ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonProduto key={i} />)
        ) : produtosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">Tente outro termo de busca</p>
          </div>
        ) : (
          produtosFiltrados.map(produto => {
            const qtdCarrinho = getQuantidadeNoCarrinho(produto.id)
            const semPreco = !produto.preco_env

            return (
              <button
                key={produto.id}
                onClick={() => !semPreco && setProdutoModal(produto)}
                disabled={semPreco}
                className={`
                  bg-white rounded-xl border p-4 text-left transition-all duration-150 w-full
                  ${semPreco
                    ? 'border-gray-100 opacity-60 cursor-not-allowed'
                    : qtdCarrinho > 0
                    ? 'border-primary shadow-md'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-sm active:shadow-md'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Badge variante="default" className="flex-shrink-0 mt-0.5">{produto.codigo}</Badge>
                    <span className="text-sm font-medium text-gray-800 leading-tight">{produto.nome}</span>
                  </div>
                  {qtdCarrinho > 0 && (
                    <Badge variante="primary" className="flex-shrink-0">
                      {qtdCarrinho}x
                    </Badge>
                  )}
                  {semPreco && (
                    <Badge variante="warning" className="flex-shrink-0">Sem preço</Badge>
                  )}
                </div>

                {!semPreco && (
                  <div className="flex gap-4 mt-2 pt-2 border-t border-gray-50">
                    {produto.preco_g && (
                      <span className="text-xs text-gray-500">
                        /g: <span className="font-semibold text-gray-700">R$ {produto.preco_g.toFixed(2)}</span>
                      </span>
                    )}
                    {produto.preco_env && (
                      <span className="text-xs text-gray-500">
                        /env: <span className="font-semibold text-primary">R$ {produto.preco_env.toFixed(2)}</span>
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>

      {totalItens > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-2 bg-surface border-t border-gray-100">
          <Button
            larguraTotal
            onClick={onVerCarrinho}
            className="h-14 text-base"
          >
            <ShoppingCart size={20} />
            Ver carrinho ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
          </Button>
        </div>
      )}

      {produtoModal && (
        <ModalQuantidade
          produto={produtoModal}
          quantidadeAtual={getQuantidadeNoCarrinho(produtoModal.id)}
          onConfirmar={handleConfirmarQuantidade}
          onFechar={() => setProdutoModal(null)}
        />
      )}
    </div>
  )
}
