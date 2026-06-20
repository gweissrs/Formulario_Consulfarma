import { useState, useCallback } from 'react'
import { Toaster } from 'react-hot-toast'
import { usePedido } from '../hooks/usePedido'
import { IntroAnimation } from '../components/IntroAnimation'
import { AtendentePicker } from '../components/AtendentePicker'
import { ClienteForm } from '../components/ClienteForm'
import { ProdutoSelector } from '../components/ProdutoSelector'
import { Checkout } from '../components/Checkout'
import { Sucesso } from '../components/Sucesso'

const STEPS = {
  INTRO: 0,
  ATENDENTE: 1,
  CLIENTE: 2,
  PRODUTOS: 3,
  CHECKOUT: 4,
  SUCESSO: 5,
}

export default function App() {
  const [step, setStep] = useState(STEPS.INTRO)
  const [resultadoEnvio, setResultadoEnvio] = useState({ offline: false })

  const {
    pedido,
    setAtendente,
    setCliente,
    adicionarItem,
    removerItem,
    resetar,
    resetarMantendoAtendente,
    valorTotal,
  } = usePedido()

  const handleIntroCompleto = useCallback(() => {
    setStep(STEPS.ATENDENTE)
  }, [])

  function handleAtendenteSelecionado(atendente) {
    setAtendente(atendente)
    setStep(STEPS.CLIENTE)
  }

  function handleClienteConfirmado(cliente) {
    setCliente(cliente)
    setStep(STEPS.PRODUTOS)
  }

  function handleVerCarrinho() {
    setStep(STEPS.CHECKOUT)
  }

  function handleVoltarParaProdutos() {
    setStep(STEPS.PRODUTOS)
  }

  function handlePedidoEnviado(resultado) {
    setResultadoEnvio(resultado)
    setStep(STEPS.SUCESSO)
  }

  function handleNovoPedido() {
    resetarMantendoAtendente()
    setStep(STEPS.CLIENTE)
  }

  function handleTrocarAtendente() {
    resetar()
    setStep(STEPS.ATENDENTE)
  }

  return (
    <>
      <Toaster position="top-center" />

      {step === STEPS.INTRO && (
        <IntroAnimation onComplete={handleIntroCompleto} />
      )}

      {step === STEPS.ATENDENTE && (
        <AtendentePicker onConfirmar={handleAtendenteSelecionado} />
      )}

      {step === STEPS.CLIENTE && (
        <ClienteForm
          atendente={pedido.atendente}
          onConfirmar={handleClienteConfirmado}
        />
      )}

      {step === STEPS.PRODUTOS && (
        <ProdutoSelector
          itens={pedido.itens}
          onAdicionarItem={adicionarItem}
          onVerCarrinho={handleVerCarrinho}
        />
      )}

      {step === STEPS.CHECKOUT && (
        <Checkout
          pedido={pedido}
          valorTotal={valorTotal}
          onRemoverItem={removerItem}
          onAdicionarItem={adicionarItem}
          onVoltar={handleVoltarParaProdutos}
          onSucesso={handlePedidoEnviado}
        />
      )}

      {step === STEPS.SUCESSO && (
        <Sucesso
          pedido={pedido}
          valorTotal={valorTotal}
          offline={resultadoEnvio.offline}
          onNovoPedido={handleNovoPedido}
          onTrocarAtendente={handleTrocarAtendente}
        />
      )}
    </>
  )
}
