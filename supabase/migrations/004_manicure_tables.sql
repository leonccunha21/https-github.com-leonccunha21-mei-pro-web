-- Manicure PRO cloud sync tables

create table if not exists public.manicure_clientes (
  id text primary key,
  nome text not null,
  telefone text,
  email text,
  endereco text,
  observacoes text,
  indicado_por text,
  created_at text not null,
  updated_at text
);

create table if not exists public.manicure_servicos (
  id text primary key,
  nome text not null,
  descricao text,
  preco numeric not null,
  duracao_minutos integer not null default 30,
  categoria text,
  ativo boolean not null default true,
  created_at text not null,
  updated_at text
);

create table if not exists public.manicure_agendamentos (
  id text primary key,
  cliente_id text,
  cliente_nome text not null,
  data text not null,
  hora text not null,
  servico_id text,
  servico_nome text,
  valor numeric,
  status text not null default 'agendado',
  observacoes text,
  telefone_cliente text,
  created_at text not null,
  updated_at text
);

create table if not exists public.manicure_movimentos (
  id text primary key,
  data text not null,
  tipo text not null,
  descricao text not null,
  valor numeric not null,
  categoria text not null,
  forma_pagamento text,
  cliente_id text,
  agendamento_id text,
  created_at text not null,
  updated_at text
);

create table if not exists public.manicure_produtos (
  id text primary key,
  nome text not null,
  descricao text,
  quantidade numeric not null default 0,
  unidade text not null,
  preco_custo numeric not null default 0,
  preco_venda numeric not null default 0,
  fornecedor text,
  estoque_minimo numeric not null default 0,
  created_at text not null,
  updated_at text
);

create table if not exists public.manicure_whatsapp_instances (
  id text primary key,
  name text not null,
  status text not null default 'desconectado',
  qr_code text,
  created_at text not null
);

create table if not exists public.manicure_mensagem_templates (
  id text primary key,
  nome text not null,
  tipo text not null,
  mensagem text not null,
  ativo boolean not null default true
);

create table if not exists public.manicure_mensagens_enviadas (
  id text primary key,
  agendamento_id text,
  cliente_id text,
  cliente_nome text,
  tipo text not null,
  mensagem text not null,
  status text not null,
  data_envio text not null,
  erro text
);

create table if not exists public.manicure_config (
  id text primary key default 'singleton',
  nome_salao text not null default 'Meu Salão',
  profissional text not null default '',
  telefone_contato text,
  endereco text,
  logo text,
  whatsapp_instance_id text,
  updated_at text,
  created_at text not null default (now() at time zone 'utc')
);

-- RLS: allow all for anon key (the app uses anon key for sync)
alter table public.manicure_clientes enable row level security;
alter table public.manicure_servicos enable row level security;
alter table public.manicure_agendamentos enable row level security;
alter table public.manicure_movimentos enable row level security;
alter table public.manicure_produtos enable row level security;
alter table public.manicure_whatsapp_instances enable row level security;
alter table public.manicure_mensagem_templates enable row level security;
alter table public.manicure_mensagens_enviadas enable row level security;
alter table public.manicure_config enable row level security;

create policy "Allow all on manicure_clientes" on public.manicure_clientes for all using (true) with check (true);
create policy "Allow all on manicure_servicos" on public.manicure_servicos for all using (true) with check (true);
create policy "Allow all on manicure_agendamentos" on public.manicure_agendamentos for all using (true) with check (true);
create policy "Allow all on manicure_movimentos" on public.manicure_movimentos for all using (true) with check (true);
create policy "Allow all on manicure_produtos" on public.manicure_produtos for all using (true) with check (true);
create policy "Allow all on manicure_whatsapp_instances" on public.manicure_whatsapp_instances for all using (true) with check (true);
create policy "Allow all on manicure_mensagem_templates" on public.manicure_mensagem_templates for all using (true) with check (true);
create policy "Allow all on manicure_mensagens_enviadas" on public.manicure_mensagens_enviadas for all using (true) with check (true);
create policy "Allow all on manicure_config" on public.manicure_config for all using (true) with check (true);
