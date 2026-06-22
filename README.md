# 🍽️ SRMS — Smart Restaurant Management System (SaaS Edition)

A multi-tenant, full-stack restaurant management platform. Each restaurant that signs up gets
its own isolated workspace (tables, menu, orders, billing, staff, reports) inside one shared
deployment — so you can run it as a single product and sell access to many restaurants.

For step-by-step deployment instructions (Vercel + Render + MongoDB Atlas), see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## 🚀 Features

| Module | Features |
|--------|----------|
| **Multi-tenant accounts** | Each restaurant signs up at `/register` and gets its own isolated data |
| **Authentication** | Role-based login (Admin / Waiter / Kitchen), JWT-based |
| **Admin Dashboard** | Revenue stats, table overview, order tracking, charts |
| **Table Management** | Visual layout, status tracking, add/remove tables |
| **Menu Management** | Add/edit/delete items, categories, availability toggle |
| **Digital Ordering** | Full menu with cart, item customization notes |
| **Kitchen Display** | Live order feed (per-restaurant Socket.io rooms), status flow |
| **Billing System** | Auto bill generation, GST calculation, payment modes |
| **Reports** | Daily & monthly revenue, top items, payment breakdown |
| **Staff Management** | Add/edit/deactivate staff accounts (scoped to your restaurant) |
| **Mobile friendly** | Responsive layout with a collapsible mobile nav drawer |

---

## 🛠️ Tech Stack

- **Frontend:** React.js, React Router, Recharts, Socket.io-client, React Hot Toast
- **Backend:** Node.js, Express.js, Socket.io, Mongoose
- **Database:** MongoDB (designed for MongoDB Atlas)
- **Auth:** JWT + bcryptjs

---

## 🏢 How the SaaS / multi-tenant model works

- Every restaurant is a `Restaurant` document (tenant) with its own `slug`, plan, and settings.
- Every `User`, `Table`, `MenuItem`, `Order`, and `Bill` document is tagged with a `restaurantId`.
- Every API route filters and writes using the logged-in user's `restaurantId` — restaurants can
  never see or modify each other's data.
- New restaurants self-serve at `/register`: it creates the `Restaurant` + the first `admin` user
  in one step, with 10 starter tables. The admin can then add staff, build their menu, etc.
- `Restaurant.plan` (`trial` / `basic` / `pro` / `enterprise`) and `Restaurant.active` are there as
  hooks for you to wire up billing (e.g. Stripe) and to disable/suspend an account without deleting data.

---

## ⚙️ Local development

### Prerequisites
- Node.js v18+
- A MongoDB connection string (local `mongod`, or a free MongoDB Atlas cluster — recommended even for local dev)

### Setup

```bash
# From the srms/ folder
cp backend/.env.example backend/.env      # then edit MONGODB_URI / JWT_SECRET
cp frontend/.env.example frontend/.env    # leave as-is for local dev

npm install --prefix backend
npm install --prefix frontend

# Run both backend (port 5000) and frontend (port 3000)
npm start
```

Open `http://localhost:3000/register` and create your first restaurant account — there is no
pre-seeded demo data, since each tenant builds its own.

---

## 🗂️ Project Structure

```
srms/
├── backend/
│   ├── models/          # Restaurant, User, Table, MenuItem, Order, Bill (all tenant-scoped)
│   ├── routes/          # auth, tables, menu, orders, bills, reports, users
│   ├── middleware/auth.js
│   ├── server.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── context/AuthContext.js, SocketContext.js
│       ├── pages/Login.js, Register.js, admin/, waiter/, kitchen/
│       ├── components/shared/Sidebar.js
│       └── index.css
├── render.yaml          # Render blueprint for the backend
└── DEPLOYMENT.md
```

---

## 🌐 Key API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Sign up a new restaurant + admin user |
| POST | /api/auth/login | Login |
| GET | /api/tables | Get this restaurant's tables |
| GET | /api/menu | Get this restaurant's menu |
| POST | /api/orders | Create order |
| PUT | /api/orders/:id/status | Update order status |
| POST | /api/bills | Generate bill |
| GET | /api/reports/dashboard | Dashboard stats |
| GET | /api/health | Health check (used by Render) |

---

## 🔮 Future Enhancements

- Stripe billing tied to `Restaurant.plan`
- QR code table-side ordering
- Online reservations
- Inventory management
- Native mobile app (reuse the same API)

---

## 📄 License

MIT — Free to use and modify.
