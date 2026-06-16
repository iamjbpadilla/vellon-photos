-- Create receipts storage bucket for payment proof uploads
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist
drop policy if exists "Authenticated users can upload receipts" on storage.objects;
drop policy if exists "Public can view receipts" on storage.objects;
drop policy if exists "Users can delete their own receipts" on storage.objects;

-- Policy: Authenticated users can upload receipts
create policy "Authenticated users can upload receipts"
on storage.objects for insert
to authenticated
with check (bucket_id = 'receipts');

-- Policy: Public can view receipts (for admin verification)
create policy "Public can view receipts"
on storage.objects for select
to public
using (bucket_id = 'receipts');

-- Policy: Users can delete their own receipts
create policy "Users can delete their own receipts"
on storage.objects for delete
to authenticated
using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
