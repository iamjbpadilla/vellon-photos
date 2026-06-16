-- Create payment settings table for configurable QR code and recipient info
create table payment_settings (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null default 999,
  recipient_name text not null default 'JU**T P.',
  qr_code_url text,
  gcash_number text default '0917-XXX-XXXX',
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert default payment settings
insert into payment_settings (amount, recipient_name, qr_code_url, gcash_number)
values (999, 'JU**T P.', '/gcash-qr.png', '0917-XXX-XXXX');

-- Add comment
comment on table payment_settings is 'Configurable payment settings for QR code and recipient information';

-- Enable RLS
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
