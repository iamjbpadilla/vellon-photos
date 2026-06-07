# Vellon.photos

Premium event photo gallery service. One price. Every moment.

## Features

- **Landing Page** — Glassmorphism hero with Framer Motion animations
- **Authentication** — Login, register, forgot-password with Supabase Auth
- **Client Portal** — Dashboard with events overview, photo counts, view analytics
- **Event Gallery** — Public gallery with photo upload, QR code sharing, download all
- **Admin Portal** — User management, event oversight, payment verification, voucher management
- **Voucher System** — Discount codes for event creation with usage limits
- **Onboarding Flow** — 3-step guided tour for new users
- **Lifecycle Automation** — Vercel Cron for expiry warnings and auto-purge
- **Email Notifications** — Resend-powered transactional emails

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL with RLS)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth
- **Email:** Resend
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel

## Getting Started

### Prerequisites

1. Run the database schema in Supabase SQL Editor:
   ```bash
   # Copy and run supabase-schema.sql from the project root
   ```

2. Create storage bucket in Supabase Dashboard:
   - Storage > New Bucket
   - Name: `event-photos`
   - Public: false

3. Assign admin role after signup:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```

### Installation

```bash
cd vellon-app
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=noreply@vellon.photos
ADMIN_EMAILS=your@email.com
CRON_SECRET=your_random_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Vercel Cron

The lifecycle automation runs via Vercel Cron:
- Path: `/api/cron/lifecycle`
- Schedule: Daily at 3 AM UTC
- Secret: `CRON_SECRET`

## Project Structure

```
vellon-app/
├── src/
│   ├── app/
│   │   ├── api/cron/lifecycle/    # Lifecycle automation
│   │   ├── admin/                  # Admin portal
│   │   ├── dashboard/              # Client portal
│   │   ├── event/[event_code]/     # Public gallery
│   │   ├── login/                  # Auth pages
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css             # Global styles
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts           # Browser client
│   │       └── server.ts           # Server client
│   └── middleware.ts               # Auth middleware
├── .env.example
├── vercel.json
└── package.json
```

## Pricing

Single-tier pricing: ₱699 per event for 15 days.

## License

MIT

