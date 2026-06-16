-- Update default QR code URL in payment settings
update payment_settings
set qr_code_url = '/gcash-qr.png'
where id = (select id from payment_settings limit 1);
