import { useState, useCallback, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { usePedido } from '../hooks/usePedido'
import { syncPedidosPendentes } from '../lib/offline'
import { IntroAnimation } from '../components/IntroAnimation'
import { ProgressBar } from '../components/ProgressBar'
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

  useEffect(() => {
    const handleOnline = async () => {
      const resultado = await syncPedidosPendentes()
      if (resultado.sincronizados > 0) {
        toast.success(
          `${resultado.sincronizados} pedido(s) sincronizado(s) com sucesso.`,
          { duration: 4000 }
        )
      }
    }

    window.addEventListener('online', handleOnline)

    if (navigator.onLine) {
      syncPedidosPendentes()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])

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

  function handleVoltar() {
    if (step === STEPS.CLIENTE) setStep(STEPS.ATENDENTE)
    else if (step === STEPS.PRODUTOS) setStep(STEPS.CLIENTE)
    else if (step === STEPS.CHECKOUT) setStep(STEPS.PRODUTOS)
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

  const mostrarProgressBar = step >= STEPS.ATENDENTE && step <= STEPS.CHECKOUT

  return (
    <>
      <Toaster position="top-center" />

      {mostrarProgressBar && (
        <ProgressBar
          step={step}
          onVoltar={step > STEPS.ATENDENTE ? handleVoltar : null}
        />
      )}

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
