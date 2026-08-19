# niharikartist — Haute Fine Art Atelier & E-Commerce Platform

A full-stack luxury fine art e-commerce platform for artist **Niharika**, specializing in original handpainted masterworks, bespoke keepsakes, pencil portraits, and spiritual artwork. Each piece ships with a complimentary wax-sealed calligraphy scroll.

> "Preserving tender moments in canvas & gold wax."

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Admin Portal](#admin-portal)
- [Database & Seeding](#database--seeding)
- [Product Categories](#product-categories)
- [Cart & Coupon System](#cart--coupon-system)
- [Order Tracking](#order-tracking)
- [Deployment](#deployment)

---

## Overview

niharikartist is a high-end art commerce platform with a strong editorial aesthetic — dark emerald backgrounds, gold accents, and luxury typography. It supports the full customer journey from browsing a curated gallery to checkout and post-purchase order tracking, alongside a comprehensive admin console for inventory and order management.

**Live site:** [niharikartist.shop](https://niharikartist.shop)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.6 | App Router, SSR/SSG |
| React | 19.2.4 | UI framework |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| Framer Motion | ^12 | Animations & transitions |
| Radix UI | various | Accessible UI primitives |
| Zustand | ^5 | Lightweight state management |
| Axios | ^1.16 | HTTP client |
| Recharts | ^3.8 | Admin dashboard charts |
| React Hot Toast | ^2.6 | Notification toasts |
| Lucide React | ^1.14 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express | ^4.19 | API framework |
| Supabase JS | ^2.112 | Database & auth client |
| PostgreSQL (via pg) | ^8.23 | Database driver |
| jsonwebtoken | ^9.0 | JWT-based admin auth |
| bcryptjs | ^3.0 | Password hashing |
| Morgan | ^1.10 | HTTP request logging |
| CORS | ^2.8 | Cross-origin support |
| dotenv | ^16.4 | Environment configuration |
| Nodemon | ^3.1 | Dev auto-restart |

### Database
- **Supabase** (hosted PostgreSQL) — products, gallery, orders, inquiries, subscribers, admin users, categories, settings

---

## Project Structure

```
niharikartist/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # Supabase client setup
│   │   ├── controllers/
│   │   │   ├── adminAuthController.js # JWT login/logout
│   │   │   ├── categoryController.js  # Category CRUD
│   │   │   ├── contactController.js   # Commission inquiries & newsletter
│   │   │   ├── galleryController.js   # Gallery CRUD
│   │   │   ├── orderController.js     # Order creation, tracking, admin
│   │   │   ├── productController.js   # Product CRUD, sync from live site
│   │   │   └── settingController.js   # Site settings
│   │   ├── middleware/
│   │   │   └── authMiddleware.js      # JWT verification for admin routes
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── contactRoutes.js
│   │   │   ├── galleryRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── settingRoutes.js
│   │   ├── seed/
│   │   │   ├── seedData.js            # Product seed data
│   │   │   ├── gallerySeedData.js     # Gallery seed data (50 items)
│   │   │   ├── seeder.js              # Main seeder script
│   │   │   └── seedSupabase.js        # Supabase seeder
│   │   ├── run_migration.js           # DB migration helper
│   │   └── server.js                  # Express app entry point
│   ├── .env                           # Local environment variables
│   ├── .env.example                   # Environment template
│   └── package.json
│
└── frontend/
    ├── app/
    │   ├── layout.tsx                 # Root layout, providers, fonts, metadata
    │   ├── page.tsx                   # Home page — hero, manifesto, featured products
    │   ├── about/                     # Artist biography
    │   ├── gallery/                   # 50+ curated exhibition masterworks
    │   ├── shop/                      # Product catalog with filtering & sorting
    │   ├── product/[slug]/            # Individual product detail pages
    │   ├── cart/                      # Shopping bag & coupon
    │   ├── checkout/                  # Checkout flow
    │   ├── admin/                     # Full admin dashboard
    │   ├── community/                 # Exhibition journal
    │   ├── contact/                   # Commission inquiry form
    │   ├── track-order/               # Order tracking by ID or email
    │   ├── wishlist/                  # Saved favourites
    │   ├── faq/
    │   ├── shipping/
    │   ├── terms/
    │   ├── privacy-policy/
    │   └── refund-returns-policy/
    ├── components/
    │   ├── Header.tsx                 # Sticky nav, announcement ribbon, cart icon
    │   ├── Footer.tsx                 # 5-column footer with links and brand story
    │   ├── ProductCard.tsx            # Reusable product tile
    │   ├── CartDrawer.tsx             # Slide-out cart preview
    │   └── LaunchPremiereStage.tsx    # Launch/premiere announcement component
    ├── context/
    │   ├── CartContext.tsx            # Global cart state + coupon logic
    │   └── WishlistContext.tsx        # Wishlist state
    ├── public/images/
    │   ├── gallery/                   # gallery_1.jpg → gallery_50.jpg
    │   └── product_*.jpg              # Product images
    ├── next.config.ts
    ├── tailwind.config / postcss.config
    └── package.json
```

---

## Features

### Storefront
- **Home page** — asymmetric editorial hero, artist manifesto, featured product grid, craftsmanship pillars (Archival, Original, Personalized, Heirloom)
- **Gallery** — full exhibition of 50+ masterworks with search and category filtering
- **Shop** — product catalog with category tabs, price/newest sorting, and text search
- **Product detail** — full artwork metadata (medium, size, surface, type), image gallery, custom note input, size selector, add to cart
- **Cart** — persistent cart with quantity adjustment, coupon codes, free shipping progress bar
- **Checkout** — customer details, address, payment method (COD / card)
- **Order tracking** — look up any order by Order ID or email
- **Wishlist** — save favourites across sessions
- **Commission contact** — inquiry form for bespoke artwork requests
- **Journal / Community** — editorial blog-style page

### Admin Portal (`/admin`)
- Secure JWT login
- Dashboard overview — revenue, active orders, inventory count, gallery size
- **Products tab** — full CRUD, featured toggle, sync from live site
- **Gallery tab** — full CRUD, image URL management, featured toggle
- **Orders tab** — view all orders, update status with timestamped timeline events
- **Inquiries tab** — view commission requests and newsletter subscribers
- Data visualised with Recharts

### Technical Highlights
- Dark-mode-first design system with editorial typography (Cinzel, Cormorant Garamond, Great Vibes, Plus Jakarta Sans)
- Fully responsive with mobile hamburger menu
- LocalStorage persistence for cart and wishlist (no account needed to shop)
- Toast notifications for all user actions
- Product sync from live production site via HTTPS fetch
- Auto-generated order IDs (`NA-XXXXX`) and tracking numbers (`SR-XXXXXXXXX`)
- CORS configured for local dev and production domain

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **Supabase** project with the required tables (see [Database & Seeding](#database--seeding))

---

## Getting Started

### Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `backend/.env` — see [Environment Variables](#environment-variables).

Start the development server:

```bash
npm run dev        # with auto-restart (nodemon)
# or
npm start          # production
```

The API will be running at **http://localhost:5000**.

Verify it's working:

```
GET http://localhost:5000/api/health
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be running at **http://localhost:3000**.

To build for production:

```bash
npm run build
npm start
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key (server-side) |
| `NODE_ENV` | No | `development` or `production` |
| `CLIENT_URL` | No | Frontend origin for CORS (default: `http://localhost:3000`) |
| `JWT_SECRET` | No | Secret for JWT signing (has a built-in fallback — **change in production**) |

Example:

```env
PORT=5000
SUPABASE_URL=https://abcdefghijkl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_strong_secret_here
```

> **Note:** The `SUPABASE_SERVICE_ROLE_KEY` grants full database access. Never expose it in the frontend or commit it to version control.

---

## API Reference

All endpoints are prefixed with `/api`.

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Server health check |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List all products. Query params: `category`, `search`, `sort` (`price_asc`, `price_desc`, `newest`), `featured` |
| GET | `/products/:slug` | Public | Get single product by slug or UUID |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/products/sync` | Admin | Sync products from live niharikartist.shop |

### Gallery
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/gallery` | Public | List gallery items. Query params: `search`, `category`, `featured` |
| GET | `/gallery/:id` | Public | Get single gallery item |
| POST | `/gallery` | Admin | Create gallery item |
| PUT | `/gallery/:id` | Admin | Update gallery item |
| DELETE | `/gallery/:id` | Admin | Delete gallery item |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Public | Create a new order |
| GET | `/orders/track` | Public | Track order by `orderId` or `email` query param |
| GET | `/orders` | Admin | List all orders |
| PUT | `/orders/:id/status` | Admin | Update order status with timeline event |

### Contact
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/contact/inquiry` | Public | Submit a commission inquiry |
| POST | `/contact/subscribe` | Public | Newsletter signup |
| GET | `/contact/inquiries` | Admin | List all commission inquiries |
| GET | `/contact/subscribers` | Admin | List newsletter subscribers |

### Categories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | List all product categories |

### Admin Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/login` | Public | Login with email & password, returns JWT |
| GET | `/admin/me` | Admin | Get current admin profile |
| POST | `/admin/logout` | Admin | Logout (client should discard token) |

### Settings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/settings` | Admin | Get site settings |
| PUT | `/settings` | Admin | Update site settings |

**Admin authentication** requires a `Bearer <token>` header on all protected routes.

---

## Admin Portal

Navigate to `/admin` in the frontend. Login with admin credentials stored in the `admin_users` Supabase table.

**Default admin credentials** are set during seeding. To create an admin user manually, insert a record into `admin_users` with a bcrypt-hashed password (`bcrypt.hash(password, 10)`).

Session is stored in `localStorage` as `niharikartist_admin_token` and expires after **7 days**.

### Admin Tabs
- **Overview** — Key metrics: revenue, order count, inventory, gallery count
- **Products** — Add/edit/delete artworks; sync from live site
- **Gallery** — Manage the exhibition portfolio
- **Orders** — View and update order status through the fulfillment pipeline: `Ordered → Processing → Shipped → Delivered`
- **Inquiries** — Commission requests and newsletter subscriber list

---

## Database & Seeding

The backend uses **Supabase PostgreSQL**. Required tables:

| Table | Description |
|---|---|
| `products` | Shop artwork inventory |
| `galleries` | Exhibition portfolio |
| `orders` | Customer orders with timeline |
| `inquiries` | Commission contact submissions |
| `subscribers` | Newsletter VIP list |
| `admin_users` | Admin accounts (bcrypt passwords) |
| `categories` | Product categories |
| `settings` | Site-wide configuration |

### Seed the database

```bash
cd backend
npm run seed
```

This runs `src/seed/seeder.js`, which populates products and gallery items. Individual seed files:

- `src/seed/seedData.js` — product records
- `src/seed/gallerySeedData.js` — 50 gallery artworks
- `src/seed/seedSupabase.js` — Supabase-specific seeder

---

## Product Categories

Products are auto-categorised by title and description keywords:

| Category | Keywords |
|---|---|
| Anime Fanart Series | goku, gojo, luffy, anime |
| Spiritual & Heritage Art | shiva, krishna, ram, ganesha, mahadev |
| Pencil & Graphite Portraits | pencil |
| Original Acrylic Paintings | acrylic, painting, embrace |
| Original Masterworks | (default fallback) |

---

## Cart & Coupon System

The cart persists in `localStorage` under the key `nha_cart`. Items are keyed by `product_id + size + custom_note`, so the same product with different customisations creates separate line items.

### Coupon Codes

| Code | Discount |
|---|---|
| `LOVEART10` | 10% off |
| `STUDIO10` | 10% off |
| `VIP10` | 10% off |
| `FIRSTGIFT` | 15% off |

Free shipping unlocks at a subtotal of **₹999**.

---

## Order Tracking

Orders are auto-assigned:
- **Order ID** format: `NA-XXXXX` (e.g. `NA-47382`)
- **Tracking number** format: `SR-XXXXXXXXX` (e.g. `SR-847291023`)

Customers can track their order at `/track-order` by entering either their Order ID or the email used at checkout.

Order statuses: `Ordered` → `Processing` → `Shipped` → `Delivered`

Each status transition is recorded as a timeline event with a timestamp and optional note.

---

## Deployment

### Backend
Deploy as a standard Node.js app (Render, Railway, Fly.io, etc.):

```bash
npm start   # runs node src/server.js
```

Ensure all environment variables are set on the hosting platform. Set `NODE_ENV=production`.

### Frontend
Deploy with Vercel (recommended for Next.js):

```bash
npm run build
```

Update the API base URL in `frontend/app/page.tsx` and other pages from `http://localhost:5000` to your production backend URL, or use a `NEXT_PUBLIC_API_URL` environment variable for cleaner management.

**Configured remote image domains** (in `next.config.ts`):
- `niharikartist.com`
- `cuddlingupmybrush.com`
- `images.unsplash.com`

---

## License

This project is proprietary. All artwork and brand assets belong to Niharika. Unauthorised reproduction of artwork or brand materials is prohibited.
