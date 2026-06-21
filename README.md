# Sistema de Pedidos COANA — Consulfarma 2026

> Aplicação web mobile-first desenvolvida para operação em campo durante a **Consulfarma 2026** (Anhembi, São Paulo — 2 a 4 de julho de 2026), permitindo que atendentes simultâneos registrem pedidos de clientes B2B em tempo real, com notificação automática por email e resiliência offline.

---

## Contexto de negócio

A **COANA Probióticos** participa da maior feira farmacêutica do Brasil atendendo farmácias, distribuidoras e clínicas. Durante o evento, os atendentes ficam em pé, em ambiente ruidoso e movimentado, com celular ou tablet na mão — o sistema precisava ser **rápido, confiável e impermeável a erros humanos**, transmitindo credibilidade para o cliente que está observando o atendente usar a ferramenta.

Não há processamento de pagamentos nem emissão de notas. O objetivo é único: **capturar o interesse comercial no momento da conversa** e notificar a equipe comercial imediatamente.

---

## Stack e decisões técnicas

### Frontend — React 18 + Vite

**Por que React?**
React foi escolhido pela maturidade do ecossistema, facilidade de composição de componentes e performance com renderizações granulares. O Vite substitui o Create React App por oferecer HMR (Hot Module Replacement) praticamente instantâneo e build significativamente mais rápido.

**Por que sem Context API ou gerenciador de estado externo?**
O fluxo da aplicação é estritamente linear: `Intro → Atendente → Cliente → Produtos → Checkout → Sucesso`. Com apenas 6 telas e estado concentrado em um único hook (`usePedido`), introduzir Context ou Redux seria over-engineering. O estado é passado via props, tornando o fluxo de dados 100% rastreável e previsível.

### Estilização — Tailwind CSS v3

**Por que Tailwind?**
Tailwind elimina a alternância mental entre arquivo JSX e CSS. Em ambiente mobile-first e de iteração visual rápida, escrever classes diretamente no JSX acelera o ciclo de design-implementação. O purge automático garante que o bundle final contenha apenas as classes utilizadas.

**Sistema de design próprio:**
Tokens semânticos foram definidos no `tailwind.config.js` (`primary`, `accent`, `bg`, `surface`, `border`, `error`, `success`) para garantir consistência visual e facilitar eventual redesign.

**Layout responsivo:**
O `#root` ocupa 100% da viewport. O conteúdo interno de cada tela usa `max-w-2xl mx-auto` para centralizar em desktop, mantendo largura total em mobile. Barras fixas (top e bottom) usam `left: 0; right: 0` para ocupar a tela toda independentemente da largura.

### Backend — Supabase (PostgreSQL)

**Por que Supabase?**
Supabase oferece PostgreSQL gerenciado com API REST gerada automaticamente via PostgREST e Edge Functions em um único produto. Para o contexto — backend sem servidor dedicado, prazo curto, equipe pequena — o Supabase elimina a necessidade de desenvolver e manter uma API própria.

**Row Level Security (RLS):**
Todas as tabelas têm RLS habilitado. As políticas foram calibradas:
- `clientes`, `pedidos` e `itens_pedido` → apenas **INSERT** via anon key
- `atendentes` → **SELECT** e **INSERT** públicos
- **DELETE** e **UPDATE** bloqueados em todas as tabelas via anon key

### Catálogo de produtos — local

Os 97 produtos COANA estão hardcoded em `src/constants/produtos.js`. Essa decisão elimina a dependência de rede para exibir o catálogo (crítico em ambiente de feira com sinal instável), reduz latência percebida para zero e simplifica a manutenção: atualizar um produto é editar um arquivo JS e reimplantar.

### Notificações — Supabase Edge Functions + Resend

A Edge Function `notify-pedido` é chamada após cada pedido registrado com sucesso — tanto no fluxo online quanto na sincronização de pedidos offline. Chamar o Resend diretamente do frontend exporia a API key no bundle. A Edge Function roda no servidor (Deno/TypeScript), mantendo a chave segura como secret de ambiente.

O envio de email é não-bloqueante: uma falha não interrompe o registro do pedido.

### Pnpm

Escolhido pelo tempo de instalação menor e gerenciamento eficiente de espaço em disco via hard links.

---

## Arquitetura da aplicação

```
src/
├── pages/
│   └── App.jsx              # Controlador central de steps (0–5) + sync offline
├── components/
│   ├── IntroAnimation.jsx   # Splash screen com animação de entrada
│   ├── ProgressBar.jsx      # Top bar fixa com navegação e progresso
│   ├── AtendentePicker.jsx  # Seleção do atendente (step 1)
│   ├── ClienteForm.jsx      # Cadastro do cliente B2B (step 2)
│   ├── ProdutoSelector.jsx  # Catálogo com busca e seleção (step 3)
│   ├── Checkout.jsx         # Revisão e envio do pedido (step 4)
│   └── Sucesso.jsx          # Confirmação pós-envio (step 5)
├── constants/
│   └── produtos.js          # 97 produtos COANA hardcoded
├── hooks/
│   └── usePedido.js         # Estado do pedido em andamento
└── lib/
    ├── supabase.js          # Cliente Supabase configurado
    └── offline.js           # Buffer localStorage + sincronização
supabase/
├── schema.sql               # DDL completo com RLS e índices
└── functions/
    └── notify-pedido/
        └── index.ts         # Edge Function — email via Resend
```

### Schema de `itens_pedido`

Os itens não usam FK para a tabela de produtos. Em vez disso, armazenam `codigo_produto` e `nome_produto` diretamente. Isso desacopla os registros históricos de pedidos do catálogo de produtos — um produto pode ser editado ou removido sem afetar pedidos já registrados.

```sql
itens_pedido (
  id              uuid primary key,
  pedido_id       uuid references pedidos(id),
  codigo_produto  text,
  nome_produto    text,
  quantidade      integer,
  preco_unitario  numeric,
  subtotal        numeric
)
```

### Fluxo de dados — pedido online

```
[Atendente confirma no Checkout]
  └── Supabase INSERT: clientes → atendentes → pedidos → itens_pedido
        └── Edge Function notify-pedido → Resend → email
              └── onSucesso({ offline: false }) → tela de Sucesso
```

### Fluxo de dados — pedido offline

```
[Rede indisponível no momento do envio]
  └── salvarPedidoLocal(pedido) → localStorage
        └── onSucesso({ offline: true }) → tela de Sucesso com banner amarelo

[Rede retorna — evento 'online' ou 'visibilitychange']
  └── syncPedidosPendentes()  ← mutex impede chamadas concorrentes
        ├── Busca atendente existente por nome (evita duplicatas)
        ├── Supabase INSERT: clientes → atendentes → pedidos → itens_pedido
        ├── Edge Function notify-pedido → email
        ├── removerPedidoLocal(timestamp)
        └── toast de confirmação ao atendente
```

**UUIDs gerados no cliente:**
Para evitar `SELECT` após `INSERT` (bloqueado pelo RLS), os IDs são gerados no frontend via `crypto.randomUUID()`. Elimina round-trip ao banco e mantém consistência das políticas de segurança.

---

## Decisões de UX

### Mobile-first com suporte a desktop

O ambiente principal de uso é mobile (atendente em pé com celular). Todos os elementos interativos têm altura mínima de 52px. Em desktop, o conteúdo centraliza em coluna (`max-w-2xl`) enquanto as barras fixas se expandem para full-width.

### ProgressBar unificada

Uma **ProgressBar fixa no topo** com três informações simultâneas: botão de voltar contextual, nome da etapa atual e contador "Etapa X de 4". A barra linear comunica o avanço sem texto adicional, reduzindo carga cognitiva.

### Offline-first com buffer local

Se a rede falhar no momento do envio, o pedido é salvo no `localStorage` com feedback claro ao atendente (banner amarelo). Na reconexão, a sincronização é automática e dispara o email normalmente. O banner só aparece quando o dispositivo estava genuinamente sem rede — pedidos com erro de Supabase enquanto online não exibem o banner.

### Mini-modal inline no seletor de produtos

Painel que expande abaixo do card selecionado para definir quantidade, mantendo o contexto visual do produto sem interromper o fluxo de navegação da lista.

### Botão flutuante com valor em tempo real

O CTA de revisão exibe `Revisar pedido · N produtos · R$ X.XXX,XX` em tempo real, permitindo mostrar o total ao cliente antes de finalizar.

### Validação inline com mensagens específicas

Mensagens de erro contextuais por campo, ativadas no `onBlur` para evitar erros prematuros durante a digitação.

### Animações em CSS puro

Sem bibliotecas de animação. Todas as transições são implementadas via `@keyframes` no `index.css`, executadas na GPU via `transform` e `opacity`.

### Tipografia

**Inter** (sans-serif) em toda a interface — projetada para legibilidade em telas digitais. Textos numéricos recebem `letter-spacing: -0.02em` para leitura mais rápida de valores monetários.

---

## Segurança

| Vetor | Mitigação |
|---|---|
| Exposição da anon key | RLS bloqueia SELECT em dados sensíveis; INSERT-only para operações do app |
| Injeção via formulário | Supabase usa queries parametrizadas por padrão (PostgREST) |
| Exposição da API key do Resend | Chave armazenada como secret na Edge Function, nunca no frontend |
| Modificação de pedidos | UPDATE e DELETE bloqueados via RLS para anon |
| Enumeração de clientes | SELECT bloqueado em `clientes`, `pedidos` e `itens_pedido` |

---

## Instalação e execução local

```bash
git clone https://github.com/gweissrs/Formulario_Consulfarma.git
cd Formulario_Consulfarma
pnpm install
pnpm dev
```

### Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-publishable-key
```

> Use a **Publishable key** do Supabase (prefixo `sb_publishable_...`), não a Secret key.

### Banco de dados

Execute no SQL Editor do Supabase:

```
supabase/schema.sql   # Criação das tabelas, RLS e índices
```

### Edge Function

```bash
supabase secrets set RESEND_API_KEY=re_sua_chave
supabase secrets set EMAIL_DESTINO=destino@empresa.com.br
supabase functions deploy notify-pedido
```

---

## Licença

Projeto proprietário. Todos os direitos reservados à COANA Probióticos.
