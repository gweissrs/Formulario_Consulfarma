# Sistema de Pedidos COANA — Consulfarma 2026

> Aplicação web mobile-first desenvolvida para operação em campo durante a **Consulfarma 2026** (Anhembi, São Paulo — 2 a 4 de julho de 2026), permitindo que 8 atendentes simultâneos registrem pedidos de clientes B2B em tempo real, com notificação automática por email e resiliência offline.

---

## Contexto de negócio

A **COANA Probióticos** participa da maior feira farmacêutica do Brasil atendendo farmácias, distribuidoras e clínicas. Durante o evento, os atendentes ficam em pé, em ambiente ruidoso e movimentado, com celular ou tablet na mão — o sistema precisava ser **rápido, confiável e impermeável a erros humanos**, transmitindo credibilidade para o cliente que está observando o atendente usar a ferramenta.

Não há processamento de pagamentos nem emissão de notas. O objetivo é único: **capturar o interesse comercial no momento da conversa** e notificar a equipe comercial imediatamente.

---

## Stack e decisões técnicas

### Frontend — React 18 + Vite

**Por que React?**
React foi escolhido pela maturidade do ecossistema, facilidade de composição de componentes e performance com renderizações granulares. O Vite substitui o Create React App por oferecer HMR (Hot Module Replacement) praticamente instantâneo e build significativamente mais rápido — crítico para iterações rápidas no dia a dia de desenvolvimento.

**Por que sem Context API ou gerenciador de estado externo (Redux, Zustand)?**
O fluxo da aplicação é estritamente linear: `Intro → Atendente → Cliente → Produtos → Checkout → Sucesso`. Com apenas 6 telas e estado concentrado em um único hook (`usePedido`), introduzir Context ou Redux seria over-engineering. O estado é passado via props, tornando o fluxo de dados 100% rastreável e previsível sem abstrações desnecessárias.

### Estilização — Tailwind CSS v3

**Por que Tailwind?**
Tailwind elimina a alternância mental entre arquivo JSX e CSS. Em ambiente mobile-first e de iteração visual rápida, escrever classes diretamente no JSX acelera o ciclo de design-implementação em 3-4x. O purge automático garante que o bundle final contenha apenas as classes utilizadas.

**Sistema de design próprio:**
Tokens semânticos foram definidos no `tailwind.config.js` (`primary`, `accent`, `bg`, `surface`, `border`, `error`, `success`) para garantir consistência visual e facilitar eventual redesign — trocar a paleta inteira exige alterar apenas o config, não varrer todos os componentes.

### Backend — Supabase (PostgreSQL)

**Por que Supabase?**
Supabase oferece PostgreSQL gerenciado com API REST gerada automaticamente via PostgREST, autenticação e Edge Functions em um único produto. Para o contexto da aplicação — backend sem servidor dedicado, prazo curto, equipe pequena — o Supabase elimina a necessidade de desenvolver e manter uma API própria.

**Row Level Security (RLS):**
Todas as tabelas têm RLS habilitado. As políticas foram cuidadosamente calibradas:
- `clientes`, `pedidos` e `itens_pedido` → apenas **INSERT** permitido via anon key (dados sensíveis protegidos contra leitura externa)
- `produtos` e `atendentes` → **SELECT** público (necessário para o funcionamento da aplicação)
- **DELETE** e **UPDATE** bloqueados em todas as tabelas via anon key

Essa configuração garante que alguém que obtenha a anon key do bundle JavaScript não consiga extrair dados de clientes ou pedidos.

### Notificações — Supabase Edge Functions + Resend

**Por que Edge Function e não chamada direta ao Resend do frontend?**
Chamar a API do Resend diretamente do frontend exporia a API key no bundle JavaScript — qualquer usuário com DevTools poderia capturá-la. A Edge Function roda no servidor (Deno/TypeScript), mantendo a chave segura como secret de ambiente.

O email é disparado de forma não-bloqueante: uma falha no envio não interrompe o registro do pedido no banco.

### Pnpm

Escolhido em vez de npm/yarn pelo tempo de instalação significativamente menor e pelo gerenciamento eficiente de espaço em disco via hard links. Em CI/CD e ambientes com múltiplos projetos, a diferença é perceptível.

---

## Arquitetura da aplicação

```
src/
├── pages/
│   └── App.jsx              # Controlador central de steps (0–5)
├── components/
│   ├── IntroAnimation.jsx   # Splash screen com animação de entrada
│   ├── ProgressBar.jsx      # Top bar fixa com navegação e progresso
│   ├── AtendentePicker.jsx  # Seleção do atendente (step 1)
│   ├── ClienteForm.jsx      # Cadastro do cliente B2B (step 2)
│   ├── ProdutoSelector.jsx  # Catálogo com busca e seleção (step 3)
│   ├── Checkout.jsx         # Revisão e envio do pedido (step 4)
│   ├── Sucesso.jsx          # Confirmação pós-envio (step 5)
│   └── ui/
│       ├── Button.jsx       # Botão com variantes (primary, secondary, ghost)
│       ├── Input.jsx        # Input com label, máscara e erro inline
│       ├── Card.jsx         # Container clicável/selecionável
│       ├── Badge.jsx        # Tags de código e status
│       └── Skeleton.jsx     # Placeholder de loading
├── hooks/
│   ├── usePedido.js         # Estado global do pedido em andamento
│   └── useAtendente.js      # Busca de atendentes com fallback estático
└── lib/
    ├── supabase.js          # Cliente Supabase configurado
    └── offline.js           # Buffer localStorage para modo offline
supabase/
├── schema.sql               # DDL completo com RLS e índices
├── seed_produtos.sql        # 97 produtos COANA
└── functions/
    └── notify-pedido/
        └── index.ts         # Edge Function — disparo de email via Resend
```

### Fluxo de dados

```
[Atendente] → App.jsx (step controller)
                ├── usePedido (estado centralizado)
                ├── salvarPedidoLocal() ← buffer offline ANTES da rede
                ├── Supabase INSERT (clientes → atendentes → pedidos → itens)
                ├── Edge Function notify-pedido → Resend → email
                └── removerPedidoLocal() ← limpeza após sucesso
```

**UUIDs gerados no cliente:**
Para evitar dependência de `SELECT` após `INSERT` (bloqueado pelo RLS), os IDs são gerados no frontend via `crypto.randomUUID()` e passados diretamente no payload. Isso elimina uma round-trip ao banco e mantém a consistência das políticas de segurança.

---

## Decisões de UX

### Mobile-first com viewport 375px

O ambiente de uso — feira com atendentes em pé — exige que cada ação seja executável com **uma mão e um polegar**. Todos os elementos interativos têm altura mínima de 52px (recomendação Apple HIG e Material Design para touch targets). O layout foi projetado para 375px (iPhone SE/mini) e testa-se expansão até 480px.

### ProgressBar unificada

Em vez de cada tela ter seu próprio cabeçalho vermelho, foi introduzida uma **ProgressBar fixa no topo** com três informações simultâneas: botão de voltar contextual, nome da etapa atual e contador "Etapa X de 4". A barra de progresso linear comunica visualmente o avanço sem texto adicional. Isso reduz a carga cognitiva e elimina inconsistências visuais entre telas.

### Offline-first com buffer local

Antes de qualquer chamada de rede, o pedido é serializado e salvo no `localStorage`. Só após confirmação do Supabase o buffer é removido. Se a rede falhar (sinal ruim em ambiente de feira é comum), o pedido fica preservado localmente com feedback claro ao atendente — eliminando o risco de perda de pedidos por instabilidade de rede.

### Mini-modal inline no seletor de produtos

O padrão inicial usava um modal fullscreen para definir quantidade — interrompia completamente o fluxo de navegação da lista. A refatoração introduziu um **painel inline** que expande abaixo do card selecionado, mantendo o contexto visual do produto e permitindo ajustar e confirmar sem perder o fio da conversa com o cliente.

### Botão flutuante com valor em tempo real

O CTA de revisão de carrinho exibe `Revisar pedido · N produtos · R$ X.XXX,XX` em tempo real. Durante uma conversa comercial, o atendente pode mostrar o total acumulado ao cliente antes de finalizar — reduz atrito na hora de confirmar o pedido.

### Validação inline com mensagens específicas

Cada campo do formulário de cliente tem mensagem de erro contextual (ex.: "CNPJ inválido. Verifique os 14 dígitos.") em vez do genérico "Campo obrigatório". A validação é ativada no `onBlur` (não no `onChange`), evitando erros prematuros enquanto o usuário ainda está digitando.

### Animações em CSS puro

Sem bibliotecas de animação (Framer Motion, GSAP). Todas as transições — intro com `fadeIn/translateY`, check de sucesso com `cubic-bezier(0.34, 1.56, 0.64, 1)` (efeito elástico), abertura do mini-modal com `slideDown` — são implementadas via `@keyframes` no `index.css`. Bundle enxuto e animações performáticas executadas na GPU via `transform` e `opacity`.

### Tipografia com hierarquia clara

- **Inter** (sans-serif) para todo o corpo da interface — projetada especificamente para legibilidade em telas digitais
- **Playfair Display** reservada apenas para títulos de tela — cria contraste tipográfico que ancora o usuário em qual etapa está
- Textos numéricos (preços, totais) recebem `letter-spacing: -0.02em` para leitura mais rápida de valores monetários

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
# Clonar o repositório
git clone https://github.com/seu-usuario/sistema-feirao-sp.git
cd sistema-feirao-sp

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Executar em desenvolvimento
pnpm dev
```

### Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Banco de dados

Execute os scripts na seguinte ordem no SQL Editor do Supabase:

```
1. supabase/schema.sql        # Criação das tabelas, RLS e índices
2. supabase/seed_produtos.sql # Carga dos 97 produtos
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
