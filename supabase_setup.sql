-- PAPERLY / SUPABASE SETUP
-- Run this entire script in Supabase > SQL Editor > New query > Run.

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  file_path text not null unique,
  category text not null default 'Other',
  expiry_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_expiry_idx on public.documents(expiry_date);

alter table public.documents enable row level security;

drop policy if exists "Users can view own documents" on public.documents;
create policy "Users can view own documents"
on public.documents for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own documents" on public.documents;
create policy "Users can insert own documents"
on public.documents for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own documents" on public.documents;
create policy "Users can update own documents"
on public.documents for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own documents" on public.documents;
create policy "Users can delete own documents"
on public.documents for delete
using (auth.uid() = user_id);

-- Private storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can read own document files" on storage.objects;
create policy "Users can read own document files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload own document files" on storage.objects;
create policy "Users can upload own document files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update own document files" on storage.objects;
create policy "Users can update own document files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own document files" on storage.objects;
create policy "Users can delete own document files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
