-- Subscription management tables for Stripe integration

create table if not exists public.subscriptions (
  id text primary key default gen_random_uuid()::text,
  user_id text not null unique,
  email text not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
  plan_id text not null default 'monthly',
  trial_end text,
  current_period_end text,
  cancel_at_period_end boolean default false,
  created_at text not null default (now() at time zone 'utc'),
  updated_at text not null default (now() at time zone 'utc')
);

-- Row Level Security
alter table public.subscriptions enable row level security;

-- Only the user can read their own subscription
create policy "Users can read own subscription"
  on public.subscriptions for select
  using (user_id = current_setting('request.jwt.claim.sub', true)::text);

-- Service role can do everything (used by webhook)
create policy "Service role full access"
  on public.subscriptions for all
  using (true)
  with check (true);

-- Trigger to auto-update updated_at
create or replace function public.update_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = (now() at time zone 'utc');
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.update_subscriptions_updated_at();
