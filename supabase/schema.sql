-- ============================================================
-- Social Media Globe — Supabase database schema
-- Paste this whole file into Supabase Dashboard → SQL Editor →
-- New query → Run. Safe to run once on a fresh project.
-- ============================================================

-- ---------- profiles ----------
-- One row per signed-up user. Created automatically when someone
-- signs up (see trigger below). info@socialmediaglobe.net is
-- automatically marked as admin the moment that account signs up.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "select own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Helper function used by policies below to check admin status
-- without causing recursive-policy issues.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "admin can select all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Auto-create a profile row whenever someone signs up.
-- info@socialmediaglobe.net becomes admin automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'phone',
    case when new.email = 'info@socialmediaglobe.net' then 'admin' else 'customer' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------- order numbering ----------
-- Order numbers look like SMG0001, SMG0002, ... and always
-- increase, generated automatically on insert.
create sequence if not exists public.smg_order_seq start 1;

create or replace function public.next_smg_order_number()
returns text
language sql
as $$
  select 'SMG' || lpad(nextval('public.smg_order_seq')::text, 4, '0');
$$;


-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.next_smg_order_number(),
  user_id uuid not null references auth.users(id),
  contact_email text not null,
  contact_phone text,
  items jsonb not null,            -- [{ "name": "...", "price": 50, "qty": 1 }, ...]
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('paypal','stripe')),
  status text not null default 'ordered' check (status in ('ordered','in_progress','completed')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "customers select own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "admin selects all orders"
  on public.orders for select
  using (public.is_admin());

create policy "customers insert own order"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "admin updates any order"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- Note: the Stripe webhook (Edge Function) writes orders using the
-- service_role key, which bypasses RLS entirely — so Stripe orders
-- don't need a matching insert policy for the customer.
