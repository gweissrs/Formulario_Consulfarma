-- Atendentes
create table atendentes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Seed atendentes
insert into atendentes (nome) values
  ('Thiago'),
  ('Leila'),
  ('Flavia'),
  ('Francine'),
  ('Edna'),
  ('Jean');

-- Produtos
create table produtos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  preco_g numeric(10,2),
  preco_env numeric(10,2),
  ativo boolean default true
);

-- Clientes
create table clientes (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  cnpj text not null,
  email text not null,
  whatsapp text not null,
  created_at timestamptz default now()
);

-- Pedidos
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id),
  atendente_id uuid references atendentes(id),
  valor_total numeric(10,2) not null,
  status text default 'pendente',
  created_at timestamptz default now()
);

-- Itens do Pedido
create table itens_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id),
  produto_id uuid references produtos(id),
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null,
  subtotal numeric(10,2) not null
);

-- Índices para relatórios
create index idx_pedidos_atendente on pedidos(atendente_id);
create index idx_pedidos_created_at on pedidos(created_at);
create index idx_itens_produto on itens_pedido(produto_id);

-- RLS: habilitar para todas as tabelas
alter table atendentes enable row level security;
alter table produtos enable row level security;
alter table clientes enable row level security;
alter table pedidos enable row level security;
alter table itens_pedido enable row level security;

-- Políticas públicas de leitura (anon pode ler atendentes e produtos)
create policy "Atendentes visíveis publicamente" on atendentes
  for select using (true);

create policy "Produtos visíveis publicamente" on produtos
  for select using (true);

-- Políticas de inserção para anon (atendentes de campo)
create policy "Inserir cliente" on clientes
  for insert with check (true);

create policy "Inserir pedido" on pedidos
  for insert with check (true);

create policy "Inserir itens" on itens_pedido
  for insert with check (true);

create policy "Ler pedidos próprios" on pedidos
  for select using (true);

create policy "Ler itens" on itens_pedido
  for select using (true);

create policy "Ler clientes" on clientes
  for select using (true);
