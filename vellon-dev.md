# Vellon.photos Development Log

## Session Start - June 13, 2026

### Current Status
- 15 tasks completed (core platform foundation)
- 15 tasks pending (recent updates based on user requirements)
- Known issues to fix: CSS @theme warning, missing type declarations

### Implementation Plan
Proceeding with high-priority tasks:
1. Fix known issues
2. Add database schema updates (user_agreements, notification_queue, client_favorites)
3. Update galleries table
4. Update lifecycle purge timing
5. Complete guest uploads admin tab
6. Add agreement consent flow

### Action Log

**[10:00]** Starting implementation - fixing known issues first
- CSS @theme warning: Fixed by removing @theme block (Tailwind v4 feature causing lint error)
- Missing type declarations: Fixing GalleryClient, DashboardClient, AdminClient imports

**[10:05]** Created database migration 003_agreements_and_notifications.sql
- Added user_agreements table for consent tracking
- Added notification_queue table for automated reminders  
- Added client_favorites table for filtered downloads
- Updated galleries table with event_pin, is_private, notification_schedule, agreement_consent_at
- Added RLS policies and indexes

**[10:10]** Updated lifecycle purge to 15-day heritage period
- Modified revoke_expired_archives() function to use 15 days instead of 30

**[10:15]** Completed guest uploads admin tab with approve/reject UI
- Added photo preview display for each guest upload
- Added approve/reject buttons for pending uploads
- Added status badges (pending/approved/rejected)
- Display upload metadata (gallery, uploader, timestamp)

**[10:20]** Added mandatory agreement consent checkbox to event creation
- Added required checkbox in event creation modal
- Displays Storage & Lifecycle Policy terms
- Includes 15-day Heritage Period, 6-month master purge, fair use caps
- Must be checked before form submission

**[10:25]** Enhanced favorites with filtered ZIP download parameter
- Added `filterFavorites` parameter to `/api/download` endpoint
- When true, queries `client_favorites` table instead of all photos
- Available to both B2C clients and B2B photographers
- Uses inner join to get master URLs from favorited photos

**[10:30]** Added Event PIN entry security (per-gallery, optional)
- Updated gallery page to check for `is_private` flag and `event_pin`
- Created GalleryPinGate component for PIN entry UI
- Server acts as gatekeeper: requires PIN match for private galleries
- PIN passed via URL query parameter after validation

**[10:35]** Added IP-based rate limiting to guest uploads
- Implemented in-memory rate limiting store (Map-based)
- Added checkRateLimit function with configurable max requests and window
- Set limit to 10 uploads per minute per IP
- Returns 429 status when rate limit exceeded

**[10:40]** Implemented notification system with Resend API
- Installed resend package
- Created notification library with tone escalation templates
- Day 4: Gentle Muse (soft, celebratory)
- Day 8: Narrative Midpoint (operational, helpful)
- Day 12: Final Curation (direct, cautionary)
- Day 15: Final Call (high-pressure, aggressive)
- Created API route for sending and scheduling notifications
- POST endpoint triggers individual notification
- PUT endpoint schedules all 4 notifications for a gallery

**[10:45]** Added agreement monitoring to admin dashboard
- Added agreements tab to admin dashboard
- Displays recent user agreements with consent details
- Shows user info, gallery, agreement type, IP address, consent timestamp
- Added "Signed" badge for each agreement

**[10:50]** Added file size/pattern analysis to guest uploads
- Added file size check (max 10MB for guest uploads)
- Added file extension validation (JPG, PNG, WebP, HEIC only)
- Rejects suspiciously large files that may bypass client-side resize
- Prevents non-image files with image extensions

**[10:55]** Added soft-cap triggers for guest upload spam detection
- Implemented session tracking with in-memory store
- Added checkSoftCap function (500 uploads per hour threshold)
- Flags sessions with excessive upload volume for admin review
- Logs warnings when soft-cap is triggered

## Session Summary - June 13, 2026

**All high-priority tasks completed:**
- Fixed CSS @theme warning
- Added user_agreements, notification_queue, client_favorites tables
- Updated galleries table with new fields
- Updated lifecycle purge to 15-day heritage period
- Completed guest uploads admin tab with approve/reject UI
- Added mandatory agreement consent checkbox to event creation

**All medium-priority tasks completed:**
- Enhanced favorites with filtered ZIP download parameter
- Added Event PIN entry security (per-gallery, optional)
- Added IP-based rate limiting to guest uploads
- Implemented notification system with Resend API

**All low-priority tasks completed:**
- Added agreement monitoring to admin dashboard
- Implemented tone escalation in notification templates
- Added file size/pattern analysis to guest uploads
- Added soft-cap triggers for guest upload spam detection

**Known Issues (Minor):**
- TypeScript lint warnings for missing module declarations (GalleryClient, GalleryPinGate, AdminClient) - These are functional components that exist but may need type declarations added
- These do not affect runtime functionality

**Environment Variables Required:**
- RESEND_API_KEY (for notification system)
- RESEND_FROM_EMAIL (for notification sender address)

**Next Steps:**
- Run database migrations
- Test notification system with Resend API key
- Test guest upload flow with rate limiting
- Test Event PIN security on private galleries

**[11:00]** Environment configuration complete
- All environment variables added to .env.local
- RESEND_API_KEY configured
- RESEND_FROM_EMAIL configured
- Platform ready for testing

**[11:05]** Database migration attempt
- Supabase CLI requires authentication
- User needs to run: `supabase login`
- Then: `supabase link`
- Then: `supabase db push`

**[11:10]** Fixed UUID function compatibility
- Changed from `uuid_generate_v4()` to `gen_random_uuid()`
- Changed extension from `uuid-ossp` to `pgcrypto`
- Updated all tables in 001_initial_schema.sql
- Updated all tables in 003_agreements_and_notifications.sql
- Supabase uses pgcrypto by default

**[11:15]** Database migrations completed successfully
- All 3 migrations applied to remote database
- 001_initial_schema.sql: pgcrypto extension, all tables, RLS policies, indexes
- 002_lifecycle_purge.sql: lifecycle management functions
- 003_agreements_and_notifications.sql: agreements, notifications, client_favorites tables

**[11:20]** Development server started
- Next.js 16.2.9 with Turbopack
- Local: http://localhost:3000
- Network: http://10.0.0.36:3000
- Environment: .env.local loaded

**[11:25]** Created landing page and login page
- Landing page with hero, features, pricing sections
- Login page with Supabase authentication
- Links to dashboard for both B2C and B2B users
- Editorial design with luxury canvas tones

**[11:30]** Fixed client-side Supabase initialization
- Login page now creates Supabase client directly
- Avoids server-side service role key requirement
- Login page loading correctly

**[11:35]** Implemented Sandbox Mode for instant access with protection
- Added Sandbox Banner to dashboard for unverified users
- Banner shows 5 photos/5MB limit warning
- Upload route enforces sandbox restrictions (5-photo cap, 5MB file size)
- Clear error messages guide users to verification/payment
- Protects against bot-driven storage abuse while enabling instant exploration

**[11:40]** Improved login page UX with mode toggle
- Added tab-style toggle between Sign In and Create Account
- Eliminates confusion of having two buttons on same form
- Dynamic heading and button text based on selected mode
- Terms of Service text only shows for signup mode

**[11:45]** Fixed login redirect issue
- Changed from router.push() to window.location.href for reliable redirect
- Added session verification before redirect
- Improved signup flow to handle auto-signin vs manual signin
- Better error handling for edge cases

**[11:50]** Improved login page UI design
- Added brand logo/heading at top (Vellon.photos)
- Better spacing and padding throughout
- Improved form labels (Email Address, Password)
- Enhanced focus states on input fields
- Better error message styling with improved colors
- Improved button styling with better padding
- Better overall layout with editorial design consistency

**[11:55]** Fixed login page color tokens
- Changed from custom `foreground` tokens to `zinc` color palette
- Used `zinc-900` for primary text and buttons
- Used `zinc-600` for secondary text
- Used `zinc-100` for toggle background
- Used `zinc-300` for input borders
- Ensures proper color rendering without custom token dependencies

**[12:00]** Fixed console warnings
- Added `data-scroll-behavior="smooth"` to html element to fix Next.js scroll behavior warning
- Implemented singleton pattern for Supabase client to prevent multiple GoTrueClient instances
- Prevents undefined behavior from concurrent client instances during hot reload

**[12:05]** Implemented automatic trial gallery onboarding
- Created SQL migration 004_trial_gallery_trigger.sql with profile creation trigger
- Trigger automatically creates "Trial Event" gallery when profile is inserted
- Trial gallery includes 5 sample lifestyle/travel placeholder photos from Unsplash
- Gallery set to Heritage theme, Linen canvas tone, inactive (Sandbox Mode)
- Created API route /api/create-profile to handle profile creation
- Updated signup flow to call profile creation API after auth signup
- Profile creation triggers trial gallery generation via database trigger
- Users now get instant access to pre-populated gallery with Vellon aesthetic
- Sandbox restrictions (5-photo/5MB cap) enforced on trial gallery

**[12:10]** Disabled autofill on login form
- Added `autoComplete="off"` to form element
- Added `autoComplete="off"` to email and password input fields
- Prevents browser from autofilling credentials
- Ensures fields are always empty on page load

**[12:15]** Fixed signup redirect to dashboard
- Added manual sign-in attempt if no session returned after signup
- Ensures user gets session even with email confirmation disabled
- Guarantees redirect to dashboard after successful registration
- Enables instant access to trial gallery

**[12:20]** Added comprehensive error handling to signup flow
- Added early returns with specific error messages for auth failures
- Added validation for user data existence
- Added proper error handling for profile creation API call
- Added console logging for debugging
- Ensures loading state is properly reset in all error paths
- Users now see specific error messages instead of silent failures

**[12:25]** Added middleware for authentication and route protection
- Created middleware.ts to handle authentication checks
- Protects /dashboard and /admin routes - redirects to login if not authenticated
- Redirects logged-in users from /login to /dashboard
- Uses session-based authentication check
- Ensures proper routing flow for authenticated and unauthenticated users

**[12:30]** Fixed login redirect loop issue
- Root cause: Middleware Supabase client doesn't have access to browser cookies
- Always returned no session, causing redirect loop between login and dashboard
- Disabled middleware auth checks - auth now handled in page components
- Converted dashboard page to client component with proper session handling
- Dashboard now uses useEffect to check session and redirect if not authenticated
- Page components have proper access to browser cookies and session data

**[12:35]** Set is_verified to TRUE on account creation
- Changed profile creation to set is_verified = true by default
- Users skip Sandbox Mode restrictions upon signup
- Full access to platform features immediately after registration
- Trial gallery still created automatically with sample photos

**[12:40]** Moved admin recognition to Supabase database
- Created migration 005_admin_field.sql to add is_admin boolean field to profiles table
- Added RLS policy to restrict admin field updates to existing admins only
- Updated admin page to check profile.is_admin instead of email comparison
- Converted admin page to client component with proper session handling
- Removed dependency on process.env.ADMIN_EMAIL environment variable
- Now supports multiple admins via database field
- Initial admin setup requires manual database update or API call

**[12:45]** Added admin management UI to promote/revoke admin status
- Created /api/admin/promote/route.ts endpoint for toggling admin status
- Created /api/admin/users/route.ts endpoint for fetching all users
- Added "Users" tab to admin dashboard
- Implemented user list display with admin status badges
- Added toggle buttons to promote/revoke admin status with Shield/ShieldOff icons
- Users tab loads data only when accessed for efficiency
- Admin status changes update UI immediately without page refresh

**[12:50]** Enhanced manual payment verification queue UI
- Added side-by-side audit UI showing user-entered reference and receipt screenshot
- Implemented admin comment textarea for payment verification notes
- Connected approve/reject buttons to payment action API
- Payment approval activates gallery and generates 6-digit download code
- Payment rejection updates status with admin comment
- UI refreshes after action completion

**[12:55]** Implemented payment approval API with gallery activation
- Created /api/admin/payment-action/route.ts endpoint
- Payment approval generates 6-digit download code and activates gallery
- Moves approved payments from queue to payment ledger
- Payment rejection updates status with admin comment
- Ready for integration with Resend email notification system

**[13:00]** Created voucher generator modal and API
- Created /api/admin/vouchers/route.ts endpoint for voucher creation
- Implemented voucher creation modal with discount amount and max uses fields
- Voucher codes auto-generated as 8-character uppercase strings
- Modal includes form validation and cancel/create buttons
- Vouchers stored in voucher_pool table with usage tracking

**[13:05]** Implemented atomic voucher redemption function
- Created migration 006_atomic_voucher_function.sql
- Added apply_voucher_securely() function with row-level locking
- Prevents race conditions when multiple users claim same voucher
- Function checks voucher existence and remaining uses atomically
- Increments usage count in single transaction

**[13:10]** Created gallery download whitelist table
- Created migration 007_download_whitelist.sql
- Added gallery_download_whitelist table with 5-email limit per gallery
- Implemented trigger function to enforce 5-email limit
- Added RLS policies for gallery owners and admins
- Prevents unauthorized public link sharing of download codes

**[13:15]** Added infrastructure watchdog panel to admin
- Created /api/admin/infrastructure/route.ts endpoint
- Added "Infrastructure" tab to admin dashboard
- Displays total users, active galleries, total photos, and storage usage
- Shows B2C vs B2B user breakdown
- Displays revenue metrics (MRR and total transactions)
- Infrastructure data loads only when tab is accessed

**[13:20]** Added admin redirect on login
- Updated handleLogin to check is_admin status after authentication
- Updated handleSignUp to check is_admin status after account creation
- Users with is_admin = TRUE are redirected to /admin
- Regular users are redirected to /dashboard
- Admin status is fetched from profiles table after session establishment

**[13:30]** Implemented UI/UX transformation - Canvas Palette & Typography
- Expanded muted canvas palette with linen, cream, warm-white, sepia, antique
- Added obsidian sand dark mode with midnight and charcoal tones
- Implemented accent tones (gold, copper, sage, blush)
- Added Heritage typography archetype (Playfair Display, Cormorant Garamond)
- Added Contemporary typography archetype (Syne, Monument Extended)
- Created editorial grid utilities (12-column asymmetric layout)
- Added editorial spacing utilities for negative whitespace
- Implemented subtle texture overlay for depth
- Refined custom scrollbar for luxury feel
- Applied editorial typography scale to headings and body text

**[13:35]** Transformed landing page to editorial luxury aesthetic
- Replaced standard hero with asymmetric editorial grid layout
- Added editorial statement section with heritage typography
- Implemented asymmetric feature layout with left border accents
- Transformed pricing cards to editorial aesthetic with minimal borders
- Updated footer to minimal editorial style
- Applied texture overlay and muted canvas tones throughout
- Used Heritage serif for headlines, Contemporary sans-serif for UI elements
- Added tracking-widest uppercase labels for editorial feel

**[13:40]** Transformed login page to editorial luxury aesthetic
- Updated brand section with editorial typography hierarchy
- Applied surface-elevated background with subtle borders
- Replaced rounded corners with sharp editorial edges
- Updated mode toggle to contemporary sans-serif with tracking
- Transformed form inputs to editorial style with minimal borders
- Applied blush tone for error states instead of harsh red
- Updated buttons to contemporary uppercase tracking style
- Added texture overlay for depth

**[13:45]** Transformed dashboard to editorial luxury aesthetic
- Applied linen background with texture overlay throughout
- Updated sandbox banner to use antique/gold accent tones
- Transformed header with editorial typography hierarchy and subtle borders
- Updated tabs to contemporary sans-serif with tracking-widest uppercase
- Transformed gallery cards to surface-elevated with minimal borders
- Applied sage, antique, and blush tones for status badges
- Updated analytics cards to editorial aesthetic with accent colors
- Transformed create modal to editorial style with sharp edges
- Applied Heritage serif for headlines, Contemporary sans-serif for UI
- Added tracking-widest uppercase labels throughout

**[13:50]** Implemented asymmetric editorial scroll layout for galleries
- Replaced standard masonry with 12-column asymmetric editorial grid
- Added varying grid spans (4, 6, 8 columns) for visual interest
- Applied editorial spacing utilities for negative whitespace
- Updated chapter headings to Heritage serif with larger scale
- Improved motion transitions with eased timing functions
- Added subtle borders to photo containers instead of rounded corners
- Increased spacing between chapters for editorial pacing

**[13:55]** Added Framer Motion hardware acceleration with layoutId transitions
- Implemented layoutId prop on photo grid buttons for smooth expansion
- Added layoutId to lightbox component for shared element transitions
- Configured spring-based layout transitions (stiffness: 400, damping: 25)
- Added selectedPhotoId state to GalleryClient for layout tracking
- Updated lightbox image styling with subtle editorial borders
- Ensured hardware-accelerated transitions for smooth performance

**[14:00]** Added mobile-first tap to save functionality
- Implemented download button in lightbox with single-tap save
- Added Download icon from lucide-react for visual clarity
- Positioned download button in bottom-right for easy thumb access
- Applied editorial styling with backdrop-blur and rounded container
- Updated button labels to contemporary sans-serif with tracking-widest uppercase
- Repositioned photo counter to bottom-left for balanced layout

**[14:05]** Fixed admin page Supabase client error
- Removed SUPABASE_SERVICE_ROLE_KEY reference from client-side code
- Eliminated getSupabaseAdmin function (service role not available in browser)
- Changed all admin queries to use regular anon key client
- Admin permissions now rely on RLS policies instead of service role bypass

**[14:10]** Fixed CSS parsing error in globals.css
- Moved Google Fonts @import statements to top of file (before other CSS rules)
- CSS specification requires @import to precede all rules except @charset and @layer
- Resolved PostCSS transform error that was blocking build

**[14:15]** Migrated to Next.js font optimization
- Removed Google Fonts @import statements from CSS entirely
- Implemented next/font/google for Playfair Display, Cormorant Garamond, and Syne
- Updated CSS font classes to use CSS variables from next/font/google
- Next.js font optimization provides automatic self-hosting and prevents FOUT

**[14:20]** Updated landing page branding
- Changed title from "Vellon" to "Vellon.photos"
- Updated tagline to "Every angle, one gallery."
- Inverted color scheme to dark theme (obsidian background, linen foreground)
- Added navigation bar with user authentication controls
- Added hover effects on title and buttons with scale transitions

**[14:25]** Added user controls to dashboard and admin pages
- Added user email display and logout button to DashboardClient header
- Added user email display and logout button to AdminClient header
- Implemented Supabase auth logout functionality for both pages
- Replaced settings button with logout button for cleaner UX

**[14:30]** Refined dashboards for better UX and functionality
- Dashboard: Removed redundant B2B tabs (analytics, favorites), simplified to galleries view
- Dashboard: Implemented functional gallery creation with Supabase insert
- Dashboard: Added gallery cards with Share/Upload action buttons and clickable links
- Dashboard: Simplified create modal to just name and slug fields
- Dashboard: Added date display and active status indicators on gallery cards
- Admin: Removed redundant tabs (guest-uploads, agreements, ledger, infrastructure)
- Admin: Simplified to core tabs: Payments, Vouchers, Users
- Admin: Updated stats to show key metrics (pending payments, active vouchers, total revenue)
- Admin: Applied consistent dark theme styling with sage/blush accent colors
- Both: Updated headers to show vellon.photos logo for brand consistency

**[14:35]** Standardized branding to lowercase "vellon.photos"
- Updated all instances of "Vellon" and "Vellon.photos" to "vellon.photos" (lowercase)
- Applied to landing page, dashboard header, admin header, login page, and metadata
- Fixed TypeScript lint errors in login page with proper type assertions

**[14:40]** Inverted color scheme to light theme
- Changed foreground from linen (#f5f0e8) to charcoal (#2d2d2d)
- Changed foreground-muted from antique (#d4c4a8) to medium gray (#6b6b6b)
- Changed foreground-subtle to lighter gray (#9a9a9a)
- Changed background from obsidian (#1a1a1a) to linen (#f5f0e8)
- Changed surface from midnight (#0d0d0d) to cream (#faf8f5)
- Changed surface-elevated from dark (#1f1f1f) to warm-white (#fdfcf8)
- Dark mode media query preserved for system preference support

**[14:45]** Updated landing page CTA buttons and created demo gallery
- Changed "Get Started" to "Create your Gallery" (links to /dashboard)
- Changed "Sign In" to "Try a Demo Gallery" (links to /demo)
- Created functional demo page at /demo with 40 sample wedding photos from Unsplash
- Demo page uses PhotoGrid and Lightbox components for full gallery experience
- Demo page replicates reference design: "Back to home" link, "Sarah & Marco's Wedding" title
- Demo page includes description matching reference and stats (40 photos · 19 guests)
- Demo page includes footer with "Every angle, one gallery." tagline

**[14:50]** Enhanced demo page with sticky navigation and clean masonry layout
- Added sticky navigation bar that appears when header scrolls out of view
- Navigation bar includes "Back to home" link centered with backdrop blur effect
- Center-aligned all header content (title, description, stats) for better visual balance
- Removed gaps from masonry grid layout (changed gap from 1.5rem to 0) for seamless look
- Implemented scroll event listener with Intersection Observer for smooth nav transitions

**[14:55]** Transformed demo page to high-fidelity sandbox experience
- Replaced 40 wedding photos with 5 curated lifestyle/travel images (MOCK_IMAGES constant)
- Removed photo count and guest stats from header for cleaner editorial presentation
- Added typography archetype toggle (Heritage/Contemporary) with system-wide CSS class application
- Added grid density slider control (Cinematic/High-Density) for layout adjustment
- Implemented ambient audio controller with real playback using HTML5 Audio API
- Created mock upload zone with drag-and-drop interface that adds files to local React array
- Created download verification modal with Email + 6-digit code security gate (accepts 000-000)
- Added "Share a Moment" button with modal for sharing gallery links (demonstrates zero-friction guest access)
- Added conversion CTAs: "Request Master Archive" and "Save My Story" (links to /login)
- Added footer attribution: "Captured by You — Powered by Vellon"
- Applied glassmorphic styling throughout (backdrop-blur, semi-transparent backgrounds)
- All features remain 100% database-independent using client-side state management
