-- Run once in Supabase dashboard > SQL Editor.

create table beats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  bpm int,
  musical_key text,
  cover_url text,
  preview_url text not null,
  sold boolean not null default false, -- true once the exclusive is bought; hides the beat
  created_at timestamptz not null default now()
);

alter table beats enable row level security;

-- The public site can only read beats still for sale. All writes go through the server with the secret key.
create policy "public reads unsold beats" on beats
  for select to anon, authenticated using (not sold);

-- Public bucket for 30s previews and cover art.
insert into storage.buckets (id, name, public) values ('media', 'media', true);
