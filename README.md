# DMS — Distributor Management System

A **fully offline** desktop application for managing distributors, products, orders, and payments.

Built with Electron + React + Express + SQLite + Prisma ORM + Tailwind CSS.

---

## Tech Stack

| Layer       | Technology           |
|-------------|----------------------|
| Desktop     | Electron 28          |
| Frontend    | React 18 + React Router 6 |
| Styling     | Tailwind CSS 3       |
| Backend     | Express.js 4         |
| Database    | SQLite (local file)  |
| ORM         | Prisma 5             |
| Charts      | Recharts             |

---

## Project Structure

```
dms/
├── electron/
│   ├── main.js          ← Electron entry, launches window + server
│   └── preload.js       ← Secure IPC bridge
│
├── prisma/
│   ├── schema.prisma    ← Database schema (SQLite)
│   ├── seed.js          ← Sample data seeder
│   └── dms.db           ← SQLite file (auto-created)
│
├── src/
│   ├── main/            ← Express backend (Node.js)
│   │   ├── server.js    ← Express app entry
│   │   ├── db.js        ← Prisma client singleton
│   │   └── routes/
│   │       ├── dashboard.js
│   │       ├── distributors.js
│   │       ├── products.js
│   │       ├── orders.js
│   │       └── payments.js
│   │
│   └── renderer/        ← React frontend
│       ├── public/
│       │   └── index.html
│       ├── src/
│       │   ├── App.js
│       │   ├── index.js
│       │   ├── styles/index.css
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── AppLayout.jsx  ← Main layout wrapper
│       │   │   │   ├── Sidebar.jsx    ← Navigation sidebar
│       │   │   │   └── TopBar.jsx     ← Top header bar
│       │   │   ├── dashboard/
│       │   │   │   └── StatCard.jsx
│       │   │   └── shared/
│       │   │       └── States.jsx    ← Loading, Error, Empty states
│       │   ├── pages/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Distributors.jsx
│       │   │   ├── Products.jsx
│       │   │   ├── Orders.jsx
│       │   │   ├── Payments.jsx
│       │   │   ├── Reports.jsx
│       │   │   └── Settings.jsx
│       │   ├── hooks/
│       │   │   └── useFetch.js
│       │   └── utils/
│       │       ├── api.js       ← API helpers (calls localhost:4000)
│       │       └── format.js   ← Number, date, badge formatters
│       ├── tailwind.config.js
│       └── postcss.config.js
│
└── package.json
```

---

## Quick Start

### 1. Install dependencies

```bash
# In project root
npm install

# In renderer folder
cd src/renderer && npm install && cd ../..
```

### 2. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Create database + run migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
node prisma/seed.js
```

### 3. Run in development mode

```bash
npm run dev
```

This starts:
- React dev server on `http://localhost:3000`
- Express API server on `http://127.0.0.1:4000`
- Electron window pointing to React

### 4. Build for production

```bash
npm run build
```

---

## API Endpoints

All endpoints served at `http://127.0.0.1:4000/api` (local only):

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/health`               | Server health check      |
| GET    | `/api/dashboard/summary`    | Dashboard statistics     |
| GET    | `/api/distributors`         | List distributors        |
| POST   | `/api/distributors`         | Create distributor       |
| PUT    | `/api/distributors/:id`     | Update distributor       |
| DELETE | `/api/distributors/:id`     | Delete distributor       |
| GET    | `/api/products`             | List products            |
| POST   | `/api/products`             | Create product           |
| GET    | `/api/orders`               | List orders              |
| POST   | `/api/orders`               | Create order             |
| PATCH  | `/api/orders/:id/status`    | Update order status      |
| GET    | `/api/payments`             | List payments            |
| POST   | `/api/payments`             | Record payment           |

---

## Offline Guarantee

- No internet connection ever required
- SQLite database stored at `prisma/dms.db`
- Express server binds to `127.0.0.1` only (never exposed externally)
- No Firebase, no cloud APIs, no telemetry

---

## Customization

- **Colors** — edit `src/renderer/tailwind.config.js` → `colors.primary`
- **Currency** — edit `src/renderer/src/utils/format.js` → `fmt.money`
- **Add pages** — add route in `App.js` + nav item in `Sidebar.jsx`
- **New tables** — add model in `prisma/schema.prisma`, run `npx prisma migrate dev`
