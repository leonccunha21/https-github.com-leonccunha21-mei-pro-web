-- ============================================================
-- Migration 002: Tabelas do subsite Mounjaro
-- ============================================================

-- mounjaro_clientes
create table if not exists mounjaro_clientes (
  id text primary key,
  nome text not null,
  telefone text,
  email text,
  data_nascimento text,
  sexo text,
  endereco text,
  cidade text,
  estado text,
  cpf text,
  altura_cm numeric,
  peso_inicial numeric,
  imc_inicial numeric,
  comorbidades text,
  objetivo_peso numeric,
  medico_responsavel text,
  observacoes text,
  data_inicio_tratamento text,
  ativo boolean default true,
  created_at text,
  updated_at text
);

-- mounjaro_pesagens
create table if not exists mounjaro_pesagens (
  id text primary key,
  cliente_id text not null,
  data text not null,
  peso numeric not null,
  observacoes text,
  created_at text,
  updated_at text
);

-- mounjaro_doses
create table if not exists mounjaro_doses (
  id text primary key,
  cliente_id text not null,
  data_aplicacao text not null,
  dose numeric not null,
  intervalo_dias integer not null default 7,
  local_aplicacao text,
  lote text,
  observacoes text,
  efeitos_colaterais text,
  peso_aplicacao numeric,
  pago boolean default false,
  valor_dose numeric,
  created_at text,
  updated_at text
);

-- mounjaro_pagamentos
create table if not exists mounjaro_pagamentos (
  id text primary key,
  cliente_id text not null,
  data_vencimento text not null,
  data_pagamento text,
  descricao text not null,
  valor numeric not null,
  status text not null default 'pendente',
  metodo text,
  referencia_dose_id text,
  observacoes text,
  created_at text,
  updated_at text
);

-- mounjaro_fotos
create table if not exists mounjaro_fotos (
  id text primary key,
  cliente_id text not null,
  data text not null,
  legenda text,
  imagem text,
  created_at text,
  updated_at text
);

-- mounjaro_auditoria
create table if not exists mounjaro_auditoria (
  id text primary key,
  data text not null,
  usuario text,
  entidade text not null,
  acao text not null,
  resumo text,
  cliente_id text,
  ref_id text,
  created_at text
);

-- mounjaro_config (singleton por clinica/usuario)
create table if not exists mounjaro_config (
  id text primary key default 'singleton',
  nome_clinica text default 'Mounjaro PRO',
  profissional text,
  telefone_contato text,
  valor_dose_padrao numeric default 0,
  intervalo_padrao_dias integer default 7,
  logo text,
  updated_at text
);

-- RLS policies (permissivas, como as tabelas principais)
alter table mounjaro_clientes enable row level security;
alter table mounjaro_pesagens enable row level security;
alter table mounjaro_doses enable row level security;
alter table mounjaro_pagamentos enable row level security;
alter table mounjaro_fotos enable row level security;
alter table mounjaro_auditoria enable row level security;
alter table mounjaro_config enable row level security;

create policy "Allow all on mounjaro_clientes" on mounjaro_clientes for all using (true) with check (true);
create policy "Allow all on mounjaro_pesagens" on mounjaro_pesagens for all using (true) with check (true);
create policy "Allow all on mounjaro_doses" on mounjaro_doses for all using (true) with check (true);
create policy "Allow all on mounjaro_pagamentos" on mounjaro_pagamentos for all using (true) with check (true);
create policy "Allow all on mounjaro_fotos" on mounjaro_fotos for all using (true) with check (true);
create policy "Allow all on mounjaro_auditoria" on mounjaro_auditoria for all using (true) with check (true);
create policy "Allow all on mounjaro_config" on mounjaro_config for all using (true) with check (true);
