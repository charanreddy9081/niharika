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

niharikartist is a high-end art commerce platform with a strong editorial aesthetic — dark emerald backgrounds, gold accents, and luxury typography. It supports the full customer journey from browsing a curated gallery to checkout with Razorpay payments and post-purchase order tracking, alongside a comprehensive admin console for inventory and order management.

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
| Razorpay | Payment gateway |
| SendGrid | Transactional email |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | PostgreSQL database |
| Render | Backend hosting |
| Netlify | Frontend hosting |
| Razorpay | Live payments |
| SendGrid | Email delivery |
| GoDaddy | Domain — niharikartist.shop |

---

## Project Structure

```
niharikartist/
├── backend/
│   ├── migrations/                    # SQL migration files
│   ├── src/
│   │   ├── config/db.js               # Supabase client
│   │   ├── controllers/               # Route handlers
│   │   │   ├── adminAuthController.js
│   │   │   ├── contactController.js
│   │   │   ├── galleryController.js
│   │   │   ├── galleryCategoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js   # Razorpay + OTP
│   │   │   ├── productController.js
│   │   │   ├── settingController.js
│   │   │   ├── siteContentController.js
│   │   │   ├── journalController.js
│   │   │   ├── homeTransitionController.js
│   │   │   └── userAuthController.js  # Customer auth
│   │   ├── middleware/authMiddleware.js
│   │   ├── routes/                    # Express routers
│   │   ├── seed/                      # DB seed scripts
│   │   ├── services/
│   │   │   ├── emailService.js        # SendGrid email templates
│   │   │   ├── shippingService.js     # India Post rate calculator
│   │   │   └── telegramService.js     # Admin order alerts
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                   # Home
    │   ├── about/
    │   ├── gallery/
    │   ├── shop/
    │   ├── product/[slug]/
    │   ├── cart/
    │   ├── checkout/                  # Razorpay + COD
    │   ├── order-success/
    │   ├── track-order/               # My Orders (auth required)
    │   ├── admin/
    │   ├── contact/
    │   ├── journal/
    │   ├── wishlist/
    │   ├── terms/
    │   ├── privacy-policy/
    │   └── refund-returns-policy/
    ├── components/
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── AuthModal.tsx              # Sign in / Register with OTP
    │   ├── CartDrawer.tsx
    │   ├── ThemeToggle.tsx            # Dark / Light / Pink themes
    │   └── admin/
    ├── context/
    │   ├── AuthContext.tsx            # Backend JWT auth
    │   ├── CartContext.tsx            # Cart + shipping state
    │   ├── WishlistContext.tsx
    │   └── ThemeContext.tsx
    ├── hooks/
    │   └── useSiteContent.ts          # CMS content hook
    └── public/
        └── logo.png
```

---

## Features

### Customer
- **Home** — editorial hero with cinematic slideshow, artist manifesto, featured artworks, craftsmanship pillars (all CMS-editable)
- **Gallery** — full exhibition of 50+ masterworks, category filtering (dynamic from DB), search
- **Shop** — product catalog, category tabs, price/newest sorting
- **Product detail** — artwork metadata, size selector, custom calligraphy note, add to cart
- **Cart** — persistent, quantity adjustment, coupon codes, pincode-based shipping calculator
- **Checkout** — Razorpay Standard Checkout (UPI/Cards/NetBanking) or COD, email OTP verification for guests
- **Order tracking** — requires sign-in; shows all orders, live status stepper, cancel within 24hrs
- **Auth** — register with email OTP, JWT-backed (works across devices and domains)
- **Themes** — Dark / Light / Pink (editorial blush)
- **Commission** — inquiry form, sends email to admin via SendGrid

### Admin (`/admin`)
- JWT-secured dashboard
- Overview — revenue, orders, inventory, gallery metrics
- **Products** — full CRUD, sync from live site
- **Gallery** — full CRUD, category management (add/delete custom categories)
- **Orders** — status updates, cancel/clear all, revenue reset
- **Commissions** — view all inquiries
- **Website Content** — edit every text string on the site (CMS) including craftsmanship pillars
- **Artist Images** — upload/manage hero slideshow images
- **Journal** — blog post management
- **Home Slideshow** — manage transition images

### Shipping
- Pincode-based India Post rate calculator
- Speed Post and Registered Parcel options
- Rates based on 3kg parcel incl. 18% GST, dispatched from Alwal, Hyderabad
- Zone A–D coverage for all Indian states

---

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # fill in credentials
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

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-strong-secret

SENDGRID_API_KEY=SG.your-key
SENDGRID_FROM_EMAIL=niharikaananthoja@gmail.com
ADMIN_EMAIL=niharikaananthoja@gmail.com

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-secret

TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=chat-id-1,chat-id-2

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

All endpoints are prefixed with `/api`.

### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/products` | List products |
| GET | `/products/:slug` | Single product |
| GET | `/gallery` | List gallery items |
| GET | `/gallery/:id` | Single gallery item |
| POST | `/orders` | Create order |
| GET | `/orders/track` | Track by orderId |
| GET | `/orders/my-orders` | Orders by email (auth) |
| POST | `/orders/:orderId/cancel` | Cancel within 24hrs |
| POST | `/payment/send-otp` | Send email OTP |
| POST | `/payment/verify-otp` | Verify OTP |
| POST | `/payment/create-razorpay-order` | Create Razorpay order |
| POST | `/payment/verify-razorpay` | Verify payment signature |
| GET | `/shipping/rate` | Shipping rate by pincode |
| POST | `/users/register` | Customer registration |
| POST | `/users/login` | Customer login |
| GET | `/users/me` | Get logged-in user |
| POST | `/contact/inquiry` | Submit commission inquiry |
| POST | `/contact/subscribe` | Newsletter signup |

### Admin (Bearer token required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/login` | Admin login |
| GET | `/admin/orders` | All orders |
| PUT | `/admin/orders/:id/status` | Update order status |
| DELETE | `/admin/orders/clear-all` | Delete all orders |
| GET | `/admin/gallery-categories` | List categories |
| POST | `/admin/gallery-categories` | Add category |
| DELETE | `/admin/gallery-categories/:id` | Delete category |
| GET | `/admin/content` | All CMS content |
| PUT | `/admin/content/bulk` | Bulk update CMS |

---

## Admin Portal

Navigate to `/admin`. Login with admin credentials from the `admin_users` Supabase table.

Session stored as `niharikartist_admin_token` in localStorage (7-day JWT).

---

## Database

**Supabase PostgreSQL** tables:

| Table | Description |
|---|---|
| `products` | Shop artwork inventory |
| `galleries` | Exhibition portfolio |
| `gallery_categories` | Dynamic gallery categories |
| `orders` | Customer orders with timeline |
| `inquiries` | Commission inquiries |
| `subscribers` | Newsletter list |
| `admin_users` | Admin accounts |
| `users` | Customer accounts |
| `site_content` | CMS text content |
| `artist_images` | Hero slideshow images |
| `journal_stories` | Blog posts |
| `home_transition` | Home slideshow images |
| `settings` | Site configuration |

### Run migrations

After creating your Supabase project, run the SQL files in `backend/migrations/` in order via the Supabase SQL Editor.

---

## Deployment

### Backend (Render)
- Build: `npm install`
- Start: `node src/server.js`
- Set all environment variables in Render dashboard

### Frontend (Netlify)
- Build: `npm run build`
- Publish: `.next`
- Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_WHATSAPP_NUMBER` in Netlify environment variables

### Domain
- `niharikartist.shop` — GoDaddy DNS pointing to Netlify
- A record: `75.2.60.5`
- CNAME www: `niharikartist.netlify.app`

---

## Coupon Codes

| Code | Discount |
|---|---|
| `LOVEART10` | 10% off |
| `STUDIO10` | 10% off |
| `VIP10` | 10% off |
| `FIRSTGIFT` | 15% off |

---

## Order IDs

- **Order ID** format: `NA-XXXXX` (e.g. `NA-47382`)
- **Tracking number** format: `SR-XXXXXXXXX` (e.g. `SR-847291023`)

---

## License

Proprietary. All artwork, brand assets, and content belong exclusively to Niharika Ananthoja. Unauthorised reproduction is prohibited.
