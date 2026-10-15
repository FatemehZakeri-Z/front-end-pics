# لقمه‌لذیذ (Laghme Laziz)

Persian (fa-IR), RTL food-ordering web app built from the design references in this repository.

## Stack

- **Frontend:** React 18 + Vite + React Router — fully RTL Persian UI
- **Backend:** Node.js + Express REST API under `/api`
- **Database:** PostgreSQL

The web dev server proxies `/api` to the API, so the browser talks to a single origin and the
cookie session (and the cart tied to it) works without CORS workarounds.

## Features

**Shopping experience**

- Home page: hero, trust badges, popular menu, delivery CTA, footer
- Menu with server-side search, category filtering, sorting and result count
- Product detail page with quantity picker
- Server-side cart: add / change quantity / remove / clear, persisted per session (survives reloads)
- Price calculation on the server: line totals, subtotal, delivery fee (free above 500,000 تومان), total
- Checkout with field validation (name, Iranian mobile number, address) and both client and server checks
- Order creation with transactional writes, then order history and order detail pages

**Admin dashboard** (`/admin`, requires an admin account)

- Stats: products, orders, pending orders, customers, revenue
- Product management: create, edit, toggle availability, delete — changes are written to the
  database and immediately visible in the storefront
- Order management: list every order with customer details and items, update status

## Running locally

A PostgreSQL instance must be reachable through `DATABASE_URL`.

```bash
# API
cd backend
npm install
DATABASE_URL=postgres://user:pass@localhost:5432/laghme npm start

# Web (dev server on :5173, proxies /api to the API)
cd frontend
npm install
API_PROXY_TARGET=http://localhost:8000 npm run dev
```

## Environment variables

| Variable | Used by | Default |
| --- | --- | --- |
| `DATABASE_URL` | API | — (required) |
| `PORT` | API | `8000` |
| `SESSION_SECRET` | API | dev fallback |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | API seed | `admin@laghme.ir` / `admin1234` |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | API seed | `demo@laghme.ir` / `demo1234` |
| `API_PROXY_TARGET` | Web dev server | `http://localhost:8000` |

## Seeded data

On first boot, when the `products` table is empty, 12 products across 6 categories are inserted.
A demo customer and an admin account are created when they do not exist yet.

- Admin: `admin@laghme.ir` / `admin1234`
- Customer: `demo@laghme.ir` / `demo1234`

**Change these before any real deployment.**

## Not wired up yet

- **Online payment:** checkout accepts "پرداخت آنلاین" as a preference but no payment gateway is
  connected, so no money is charged and no gateway redirect happens. Orders are placed with the
  cash-on-delivery flow. Connecting Stripe (or a local gateway) is required for real online payment.
- **Contact form / phone verification:** the contact page shows details only; nothing sends email
  or SMS.

## Notes for future sessions

Docker/compose configuration and preview environment settings for this project are managed
outside this repository.
