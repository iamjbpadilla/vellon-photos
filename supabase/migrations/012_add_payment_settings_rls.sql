-- Enable RLS on payment_settings
alter table payment_settings enable row level security;

-- Allow admins to read and write payment settings
create policy "Admins can read payment settings"
  on payment_settings for select
  using (auth.uid() in (select id from profiles where is_admin = true));

create policy "Admins can update payment settings"
  on payment_settings for update
  using (auth.uid() in (select id from profiles where is_admin = true));

-- Allow public read access (for payment page)
create policy "Public can read payment settings"
  on payment_settings for select
  using (true);
