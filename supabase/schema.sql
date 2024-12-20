-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_type as enum ('buyer', 'collection_center');
create type order_status as enum ('active', 'in_progress', 'completed', 'cancelled');
create type bid_status as enum ('pending', 'accepted', 'rejected');

-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade,
  full_name text not null,
  email text not null unique,
  user_type user_type not null,
  avatar_url text,
  phone text,
  address text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.users(id) on delete cascade,
  quantity integer not null,
  quality_parameters text,
  region text not null,
  loading_date timestamp with time zone not null,
  delivery_location text not null,
  status order_status default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bids table
create table public.bids (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  collection_center_id uuid references public.users(id) on delete cascade,
  price decimal(10,2) not null,
  notes text,
  images text[],
  status bid_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  sender_id uuid references public.users(id) on delete cascade,
  receiver_id uuid references public.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up row level security (RLS)
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.bids enable row level security;
alter table public.messages enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Buyers can create orders"
  on public.orders for insert
  using (auth.uid() = buyer_id);

create policy "Users can view relevant orders"
  on public.orders for select
  using (true);

create policy "Collection centers can create bids"
  on public.bids for insert
  using (auth.uid() = collection_center_id);

create policy "Users can view bids on their orders"
  on public.bids for select
  using (true);

create policy "Users can send messages"
  on public.messages for insert
  using (auth.uid() = sender_id);

create policy "Users can view their messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id); 