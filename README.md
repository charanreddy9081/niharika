# niharikartist — Haute Fine Art Atelier

A full-stack luxury fine art e-commerce platform for artist **Niharika Ananthoja**, specialising in original handpainted masterworks, bespoke keepsakes, pencil portraits, and spiritual artwork. Each piece ships with a complimentary wax-sealed calligraphy scroll.

> "Preserving tender moments in canvas & gold wax."

**Live site:** [niharikartist.shop](https://niharikartist.shop)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Admin Portal](#admin-portal)
- [Database](#database)
- [Deployment](#deployment)

---

## Overview

niharikartist is a high-end art commerce platform with a strong editorial aesthetic — dark emerald backgrounds, gold accents, and luxury typography. It supports the full customer journey from browsing a curated gallery to checkout with Razorpay live payments and post-purchase order tracking, alongside a comprehensive admin console for inventory and order management.

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16.2.6 | App Router, SSR/SSG |
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js ≥ 18 | Runtime |
| Express | REST API |
| Supabase JS | Database client |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| Razorpay | Live payment gateway |
| Resend | Transactional email (DKIM/DMARC) |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | PostgreSQL database |
| Render | Backend hosting |
| Netlify | Frontend hosting |
| Razorpay | Live payments (rzp_live) |
| Resend | Email API — FROM @niharikartist.shop |
| GoDaddy | Domain — niharikartist.shop |

---

## Project Structure

```
niharikartist/
├── backend/
│   ├── migrations/                    # SQL migration files
│   │   ├── 001_artist_images_and_site_content.sql
│   │   ├── 002_users_table.sql
│   │   └── 003_gallery_categories.sql
│   ├── src/
│   │   ├── config/db.js               # Supabase client
│   │   ├── controllers/
│   │   │   ├── adminAuthController.js
│   │   │   ├── contactController.js
│   │   │   ├── galleryController.js
│   │   │   ├── galleryCategoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js   # Razorpay + OTP (Resend)
│   │   │   ├── productController.js
│   │   │   ├── settingController.js
│   │   │   ├── siteContentController.js
│   │   │   ├── journalController.js
│   │   │   ├── homeTransitionController.js
│   │   │   └── userAuthController.js  # Customer auth (JWT + bcrypt)
│   │   ├── middleware/authMiddleware.js
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── services/
│   │   │   ├── emailService.js        # Resend email templates
│   │   │   ├── shippingService.js     # India Post rate calculator
│   │   │   └── telegramService.js     # Admin order/cancellation alerts
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx                 # PWA manifest, viewport, metadata
    │   ├── page.tsx                   # Home (CMS-driven)
    │   ├── about/
    │   ├── gallery/
    │   ├── shop/
    │   ├── product/[slug]/
    │   ├── cart/
    │   ├── checkout/                  # Razorpay + COD + pincode shipping
    │   ├── order-success/
    │   ├── track-order/               # My Orders (sign-in required)
    │   ├── admin/
    │   ├── contact/
    │   ├── journal/
    │   ├── wishlist/
    │   ├── terms/                     # Razorpay T&C, 24hr cancellation
    │   ├── privacy-policy/
    │   └── refund-returns-policy/
    ├── components/
    │   ├── Header.tsx                 # Logo, nav, account icon, theme toggle
    │   ├── Footer.tsx
    │   ├── AuthModal.tsx              # Sign in / Register with email OTP
    │   ├── CartDrawer.tsx
    │   ├── ThemeToggle.tsx            # Dark / Light / Pink themes
    │   └── admin/
    │       ├── AdminSiteContent.tsx   # Full CMS editor
    │       ├── AdminJournal.tsx
    │       ├── AdminArtistImages.tsx
    │       └── AdminHomeTransition.tsx
    ├── context/
    │   ├── AuthContext.tsx            # Backend JWT auth (Supabase users table)
    │   ├── CartContext.tsx            # Cart + pincode-based shipping state
    │   ├── WishlistContext.tsx
    │   └── ThemeContext.tsx           # Dark / Light / Pink theme
    ├── hooks/
    │   └── useSiteContent.ts          # CMS stale-while-revalidate hook
    └── public/
        ├── logo.png                   # niharikartist N logo
        └── manifest.json             # PWA manifest
```

---

## Features

### Customer
- **Home** — editorial hero with cinematic slideshow, artist manifesto, featured artworks, craftsmanship pillars (all CMS-editable via admin)
- **Gallery** — 50+ masterworks, dynamic category filtering, search
- **Shop** — product catalog with category tabs and sorting
- **Product detail** — size selector, custom calligraphy note, add to cart, wishlist
- **Cart** — persistent localStorage cart, coupon codes, pincode-based shipping calculator
- **Checkout** — Razorpay Standard Checkout (UPI/Cards/NetBanking/Wallets) or COD; email OTP for guests; signed-in users skip OTP
- **Shipping calculator** — India Post Speed Post & Registered Parcel rates from Alwal, Hyderabad; zone-based pricing (3kg incl. 18% GST)
- **Order tracking** — requires sign-in; shows all orders, live status stepper, cancel within 24hrs
- **Auth** — register with email OTP verification, JWT sessions (30 days), works across all domains/devices
- **Themes** — Dark / Light / Pink (luxury editorial blush)
- **Commission** — inquiry form with email notification to admin
- **PWA** — installable with niharikartist logo icon

### Admin (`/admin`)
- JWT-secured dashboard (separate admin accounts)
- **Overview** — revenue, orders, inventory, gallery counts; clear orders/revenue
- **Products** — CRUD, sync from live catalogue
- **Gallery** — CRUD, dynamic category management (add/delete)
- **Orders** — status pipeline updates, cancel all, revenue reset
- **Commissions** — view all inquiries
- **Website Content** — full CMS: edit every text on the site including craftsmanship pillar steps
- **Artist Images** — hero slideshow management
- **Journal** — blog post CRUD
- **Home Slideshow** — transition image management

### Email (Resend — inbox delivery)
- FROM: `niharikaananthoja@niharikartist.shop`
- DKIM signed with `niharikartist.shop` → DMARC PASS → inbox delivery
- Order confirmation to customer (correct payment method: Razorpay vs COD)
- New order notification to admin
- Order status updates
- Cancellation alert (with refund reminder for Razorpay orders)
- Commission inquiry notification
- OTP verification emails

### Notifications (Telegram)
- New order alert with full details, payment method, payment ID
- Order cancellation alert with refund reminder
- Links to admin panel

### Shipping
- Pincode → zone lookup (Local / A / B / C / D)
- Speed Post and Registered Parcel options
- Rates for 3kg parcel incl. 18% GST
- Dispatched from Alwal (500010), Hyderabad

---

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # fill in all credentials
npm install
npm run dev            # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT (customer auth)
JWT_SECRET=your-strong-random-secret

# Resend (transactional email — DMARC PASS)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=niharikaananthoja@niharikartist.shop
ADMIN_EMAIL=niharikaananthoja@gmail.com

# Razorpay (live)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-live-secret

# Telegram alerts
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=chat-id-1,chat-id-2

# WhatsApp
WHATSAPP_NUMBER=919XXXXXXXXX
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=https://niharikartist-backend.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=919XXXXXXXXX
```

---

## API Reference

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/products` | List products |
| GET | `/api/products/:slug` | Single product |
| GET | `/api/gallery` | List gallery items |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my-orders?email=x` | User's orders (JWT) |
| POST | `/api/orders/:orderId/cancel` | Cancel within 24hrs |
| POST | `/api/payment/send-otp` | Send email OTP |
| POST | `/api/payment/verify-otp` | Verify OTP |
| POST | `/api/payment/create-razorpay-order` | Create Razorpay order |
| POST | `/api/payment/verify-razorpay` | Verify payment signature |
| GET | `/api/shipping/rate?pincode=xxx` | Shipping rate by pincode |
| POST | `/api/users/register` | Customer registration |
| POST | `/api/users/login` | Customer login |
| GET | `/api/users/me` | Logged-in user (JWT) |
| POST | `/api/contact/inquiry` | Submit commission |
| POST | `/api/contact/subscribe` | Newsletter |

### Admin (Bearer JWT required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/:id/status` | Update status |
| DELETE | `/api/admin/orders/clear-all` | Delete all orders |
| GET | `/api/admin/gallery-categories` | List categories |
| POST | `/api/admin/gallery-categories` | Add category |
| DELETE | `/api/admin/gallery-categories/:id` | Delete category |
| GET | `/api/admin/content` | All CMS rows |
| PUT | `/api/admin/content/bulk` | Bulk update CMS |

---

## Admin Portal

Navigate to `/admin`. Login with credentials from the `admin_users` Supabase table.

Session stored as `niharikartist_admin_token` in localStorage (7-day JWT).

---

## Database

**Supabase PostgreSQL** — run migrations in `backend/migrations/` via SQL Editor in order.

| Table | Description |
|---|---|
| `products` | Shop artwork inventory |
| `galleries` | Exhibition portfolio |
| `gallery_categories` | Dynamic gallery categories |
| `orders` | Customer orders with timeline, shipping, payment |
| `inquiries` | Commission inquiries |
| `subscribers` | Newsletter list |
| `admin_users` | Admin accounts |
| `users` | Customer accounts (bcrypt passwords, JWT) |
| `site_content` | CMS editable text content |
| `artist_images` | Hero slideshow images |
| `journal_stories` | Blog posts |
| `home_transition` | Home slideshow images |
| `settings` | Site configuration |

**Important:** After creating tables, run in SQL Editor:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories DISABLE ROW LEVEL SECURITY;
GRANT ALL ON users TO anon, authenticated, service_role;
GRANT ALL ON gallery_categories TO anon, authenticated, service_role;
```

---

## Deployment

### Backend (Render)
- Build: `npm install`
- Start: `node src/server.js`
- Set all env vars in Render dashboard
- Free tier — sleeps after 15 min inactivity (KeepAlive component pings every 14 min)

### Frontend (Netlify)
- Base: `frontend/`
- Build: `npm run build`
- Publish: `.next`
- Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_WHATSAPP_NUMBER`

### Domain
- `niharikartist.shop` — GoDaddy DNS → Netlify
- A record `@` → `75.2.60.5`
- CNAME `www` → `niharikartist.netlify.app`

### Email (Resend)
- Domain `niharikartist.shop` verified on Resend
- DKIM, SPF, DMARC all configured
- FROM: `niharikaananthoja@niharikartist.shop`

### Razorpay
- Live mode enabled
- Both domains verified: `niharikartist.shop` + `niharikartist.netlify.app`

---

## Coupon Codes

Managed in `backend/src/context/CartContext.tsx` — `applyCoupon()` function. Codes are not displayed publicly.

| Code | Discount |
|---|---|
| `LOVEART10` | 10% off |
| `STUDIO10` | 10% off |
| `VIP10` | 10% off |
| `FIRSTGIFT` | 15% off |

---

## Order IDs

- Format: `NA-XXXXX` (e.g. `NA-47382`)
- Tracking: `SR-XXXXXXXXX` (e.g. `SR-847291023`)
- Cancellation window: **24 hours** from placement → full refund

---

## License

Proprietary. All artwork, brand assets, and content belong exclusively to Niharika Ananthoja. Unauthorised reproduction is prohibited.
