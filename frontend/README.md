# niharikartist — Frontend

Next.js 16 frontend for the niharikartist fine art atelier platform.

## Stack

- Next.js 16.2.6 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- React Hot Toast
- Lucide React icons

## Development

```bash
npm install
npm run dev    # http://localhost:3000
```

## Build

```bash
npm run build
```

## Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://niharikartist-backend.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=919XXXXXXXXX
```

## Deployment

Deployed on **Netlify** at [niharikartist.shop](https://niharikartist.shop).

See the root `README.md` for full project documentation.
