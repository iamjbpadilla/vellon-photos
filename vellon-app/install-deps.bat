@echo off
cd /d "C:\Users\jbpa\Desktop\mvp\vellon-photos\vellon-app"
if %errorlevel% neq 0 exit /b %errorlevel%
npm install @supabase/supabase-js @supabase/ssr resend react-email browser-image-compression jszip lucide-react framer-motion qrcode canvas-confetti @vercel/analytics
exit /b %errorlevel%
