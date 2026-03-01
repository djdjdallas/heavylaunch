-- ThreadPilot Database Schema
-- Run this migration in Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================
-- Profiles table (extends Supabase auth.users)
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro')),
  posts_generated_this_month int default 0,
  billing_period_start timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users can read and update only their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- Products table
-- ============================================
create table products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text not null,
  target_audience text not null,
  problem_solved text not null,
  url text not null,
  created_at timestamptz default now()
);

alter table products enable row level security;

create policy "Users can view own products"
  on products for select
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on products for insert
  with check (auth.uid() = user_id);

create policy "Users can update own products"
  on products for update
  using (auth.uid() = user_id);

create policy "Users can delete own products"
  on products for delete
  using (auth.uid() = user_id);

-- ============================================
-- Posts table
-- ============================================
create table posts (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  subreddit text not null,
  title text not null,
  body text not null,
  why_this_subreddit text,
  best_time_to_post text,
  status text default 'pending' check (status in ('pending', 'published', 'skipped')),
  published_at timestamptz,
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "Users can view own posts"
  on posts for select
  using (auth.uid() = user_id);

create policy "Users can insert own posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on posts for delete
  using (auth.uid() = user_id);

-- ============================================
-- Trigger: auto-create profile on user signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- Indexes for common queries
-- ============================================
create index idx_products_user_id on products(user_id);
create index idx_posts_product_id on posts(product_id);
create index idx_posts_user_id on posts(user_id);
create index idx_posts_status on posts(status);
