import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const EMAIL_DESTINO = 'coanaconsulfarma@gmail.com'

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarDataHora(isoString: string): string {
  return new Date(isoString).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function gerarHtmlEmail(payload: any): string {
  const { cliente, atendente, itens, valorTotal, criadoEm, pedidoId } = payload

  const linhasItens = itens
    .map(
      (item: any) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #374151;">${item.produto.codigo}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #374151;">${item.produto.nome}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #374151; text-align: center;">${item.quantidade}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #F3F4F6; font-size: 13px; color: #374151; text-align: right;">${formatarMoeda(item.produto.preco_env)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #F3F4F6; font-size: 13px; font-weight: 600; color: #8B2020; text-align: right;">${formatarMoeda(item.produto.preco_env * item.quantidade)}</td>
      </tr>
    `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Pedido COANA - Consulfarma 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9F9F9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9F9F9; padding: 24px 16px;">
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: #8B2020; padding: 32px 32px 24px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Novo Pedido Recebido</h1>
              <p style="margin: 8px 0 0; color: #FCA5A5; font-size: 14px;">COANA — Consulfarma 2026 | Anhembi, São Paulo</p>
              <p style="margin: 4px 0 0; color: #FCA5A5; font-size: 13px;">${formatarDataHora(criadoEm)}</p>
              ${pedidoId ? `<p style="margin: 4px 0 0; color: #FCA5A5; font-size: 11px;">Pedido #${pedidoId}</p>` : ''}
            </td>
          </tr>

          <!-- Dados do cliente e atendente -->
          <tr>
            <td style="padding: 28px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <h2 style="margin: 0 0 12px; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;">Cliente</h2>
                    <p style="margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #111827;">${cliente.razaoSocial}</p>
                    <p style="margin: 0 0 3px; font-size: 13px; color: #6B7280;">${cliente.cnpjFormatado || cliente.cnpj}</p>
                    <p style="margin: 0 0 3px; font-size: 13px; color: #6B7280;">${cliente.email}</p>
                    <p style="margin: 0; font-size: 13px; color: #6B7280;">${cliente.whatsappFormatado || cliente.whatsapp}</p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; border-left: 1px solid #F3F4F6;">
                    <h2 style="margin: 0 0 12px; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;">Atendente</h2>
                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #111827;">${atendente.nome}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tabela de produtos -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <h2 style="margin: 0 0 16px; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em;">Produtos</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #F3F4F6; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #F9FAFB;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase;">Código</th>
                    <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase;">Produto</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase;">Qtd</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase;">Unit.</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${linhasItens}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding: 20px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFF5F5; border: 1px solid #FCA5A5; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 14px; font-weight: 600; color: #374151;">Valor Total do Pedido</td>
                        <td style="text-align: right; font-size: 24px; font-weight: 800; color: #8B2020;">${formatarMoeda(valorTotal)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center;">
                Sistema de Pedidos COANA · Consulfarma 2026<br>
                Este email foi gerado automaticamente. Não responda este email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada')
    }

    const payload = await req.json()

    const html = gerarHtmlEmail(payload)

    const totalItens = payload.itens.reduce(
      (acc: number, i: any) => acc + i.quantidade,
      0
    )

    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'COANA Feirao <pedidos@coana.com.br>',
        to: [EMAIL_DESTINO],
        subject: `[Consulfarma 2026] Novo pedido — ${payload.cliente.razaoSocial} | ${totalItens} itens | R$ ${payload.valorTotal.toFixed(2)}`,
        html,
      }),
    })

    if (!resposta.ok) {
      const errBody = await resposta.text()
      throw new Error(`Resend API error: ${resposta.status} — ${errBody}`)
    }

    const data = await resposta.json()

    return new Response(JSON.stringify({ success: true, emailId: data.id }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: unknown) {
    const mensagem = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('notify-pedido error:', mensagem)
    return new Response(JSON.stringify({ error: mensagem }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
