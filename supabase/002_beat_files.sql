-- Run once in Supabase dashboard > SQL Editor.

-- Google Drive links to the full files. Row-level security is on with no policies,
-- so only the server (secret key) can read them; the public site never sees these links.
create table beat_files (
  beat_id uuid primary key references beats(id) on delete cascade,
  mp3_url text not null,
  wav_url text not null,
  stems_url text not null
);

alter table beat_files enable row level security;
