import { useState } from 'react'
import { Input } from './ui/Input'

function aplicarMascaraCNPJ(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function aplicarMascaraWhatsApp(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const camposIniciais = { razaoSocial: '', cnpj: '', email: '', whatsapp: '' }
const errosIniciais = { razaoSocial: '', cnpj: '', email: '', whatsapp: '' }

export function ClienteForm({ onConfirmar, atendente }) {
  const [campos, setCampos] = useState(camposIniciais)
  const [erros, setErros] = useState(errosIniciais)
  const [tocados, setTocados] = useState({})

  function atualizarCampo(campo, valor) {
    let valorFinal = valor
    if (campo === 'cnpj') valorFinal = aplicarMascaraCNPJ(valor)
    if (campo === 'whatsapp') valorFinal = aplicarMascaraWhatsApp(valor)

    setCampos(prev => ({ ...prev, [campo]: valorFinal }))

    if (tocados[campo]) {
      setErros(prev => ({ ...prev, [campo]: validarCampo(campo, valorFinal) }))
    }
  }

  function marcarTocado(campo) {
    setTocados(prev => ({ ...prev, [campo]: true }))
    setErros(prev => ({ ...prev, [campo]: validarCampo(campo, campos[campo]) }))
  }

  function validarCampo(campo, valor) {
    if (!valor.trim()) {
      const mensagens = {
        razaoSocial: 'Informe a razÃ£o social da empresa.',
        cnpj: 'CNPJ invÃ¡lido. Verifique os 14 dÃ­gitos.',
        email: 'Informe um e-mail vÃ¡lido.',
        whatsapp: 'NÃºmero invÃ¡lido. Use o formato (00) 00000-0000.',
      }
      return mensagens[campo]
    }
    if (campo === 'cnpj') {
      const digits = valor.replace(/\D/g, '')
      if (digits.length !== 14) return 'CNPJ invÃ¡lido. Verifique os 14 dÃ­gitos.'
    }
    if (campo === 'email' && !validarEmail(valor)) return 'Informe um e-mail vÃ¡lido.'
    if (campo === 'whatsapp') {
      const digits = valor.replace(/\D/g, '')
      if (digits.length !== 11) return 'NÃºmero invÃ¡lido. Use o formato (00) 00000-0000.'
    }
    return ''
  }

  function validarTudo() {
    const novosErros = {
      razaoSocial: validarCampo('razaoSocial', campos.razaoSocial),
      cnpj: validarCampo('cnpj', campos.cnpj),
      email: validarCampo('email', campos.email),
      whatsapp: validarCampo('whatsapp', campos.whatsapp),
    }
    setErros(novosErros)
    setTocados({ razaoSocial: true, cnpj: true, email: true, whatsapp: true })
    return Object.values(novosErros).every(e => e === '')
  }

  function handleSubmit() {
    if (!validarTudo()) return
    onConfirmar({
      razaoSocial: campos.razaoSocial.trim(),
      cnpj: campos.cnpj.replace(/\D/g, ''),
      cnpjFormatado: campos.cnpj,
      email: campos.email.trim(),
      whatsapp: campos.whatsapp.replace(/\D/g, ''),
      whatsappFormatado: campos.whatsapp,
    })
  }

  const tudoPreenchido =
    campos.razaoSocial.trim() &&
    campos.cnpj.replace(/\D/g, '').length === 14 &&
    validarEmail(campos.email) &&
    campos.whatsapp.replace(/\D/g, '').length === 11

  return (
    <div className="min-h-screen bg-bg flex flex-col step-transicao pt-[59px]">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <div className="mb-2">
          <h1 className="font-sans text-[26px] font-bold text-gray-900 mb-1">
            Dados do Cliente
          </h1>
          <p className="text-[14px] text-gray-400">
            Preencha com as informaÃ§Ãµes da empresa interessada.
          </p>
        </div>

        <Input
          label="RazÃ£o Social"
          value={campos.razaoSocial}
          onChange={e => atualizarCampo('razaoSocial', e.target.value)}
          onBlur={() => marcarTocado('razaoSocial')}
          erro={erros.razaoSocial}
          placeholder="Nome oficial da empresa"
          autoComplete="organization"
        />

        <Input
          label="CNPJ"
          value={campos.cnpj}
          onChange={e => atualizarCampo('cnpj', e.target.value)}
          onBlur={() => marcarTocado('cnpj')}
          erro={erros.cnpj}
          placeholder="00.000.000/0000-00"
          inputMode="numeric"
          maxLength={18}
        />

        <Input
          label="E-mail Corporativo"
          type="email"
          value={campos.email}
          onChange={e => atualizarCampo('email', e.target.value)}
          onBlur={() => marcarTocado('email')}
          erro={erros.email}
          placeholder="contato@empresa.com.br"
          inputMode="email"
          autoComplete="email"
        />

        <Input
          label="WhatsApp"
          value={campos.whatsapp}
          onChange={e => atualizarCampo('whatsapp', e.target.value)}
          onBlur={() => marcarTocado('whatsapp')}
          erro={erros.whatsapp}
          placeholder="(00) 00000-0000"
          inputMode="tel"
          maxLength={15}
        />
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 pb-8 pt-2">
        <button
          onClick={handleSubmit}
          disabled={!tudoPreenchido}
          className={`
            w-full h-[52px] rounded-xl font-semibold text-[15px] text-white
            bg-primary transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:bg-primary-hover active:bg-primary-dark
          `}
        >
          AvanÃ§ar para produtos â†’
        </button>
      </div>
    </div>
  )
}
