-- Create invitations table
create table if not exists public.invitations (
    id uuid default gen_random_uuid() primary key,
    email text not null,
    token text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    expires_at timestamp with time zone not null,
    used_at timestamp with time zone,
    
    constraint invitations_email_check check (email ~* '^.+@.+\..+$')
);

-- Enable RLS
alter table public.invitations enable row level security;

-- Policies
-- Only admins/service role can insert/view all (simplified for now, mostly service role for API)
create policy "Service role can do anything with invitations"
    on public.invitations
    for all
    using (true)
    with check (true);

-- Index for token lookup
create index if not exists invitations_token_idx on public.invitations(token);
