# 🚀 Advanto Roxiler

A full-stack admin panel for managing users and stores. Built with NestJS (backend) and React + Vite (frontend). The UI uses Tailwind CSS and Heroicons.

## 📌 Highlights
- Admin dashboard with sidebar navigation
- User and store listing with search, sort and filters
- Add users and store owners from the admin UI
- JWT authentication and role-based access control

## 🗂 Repository layout

```
Advanto-roxiler/
├─ Backend/
│  └─ api/                 # NestJS backend (TypeORM entities, controllers, services)
├─ frontend/               # React + Vite frontend (Tailwind, Heroicons)
├─ README.md               # This file
```

## 🔧 Prerequisites
- Node.js 16+ (LTS recommended)
- npm
- A running database (Postgres/MySQL/SQLite as configured in your TypeORM config)

## ⚙️ Environment
Create environment files for the backend (`Backend/api/.env`) and frontend if needed. Typical backend env vars:

- PORT=3600
- DATABASE_URL=postgres://user:pass@localhost:5432/dbname
- JWT_SECRET=your_jwt_secret
- NODE_ENV=development

Adjust to your environment and TypeORM configuration in `Backend/api/src/data-source.ts` or `ormconfig` files.

## 🚀 Quick start

### Backend (NestJS)
Open PowerShell and run:

```powershell
cd Backend/api
npm install
npm run dev
```

The API should be available at: http://localhost:3600

### Frontend (React + Vite)
In a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend dev server typically runs at http://localhost:5173

## 🔍 Admin usage (UI)
- Open the app in your browser and log in with an admin account.
- Use the left sidebar to switch between Users and Stores.
- Enter a search term and choose sorting or role filters for users.
- For stores, use min/max rating filters and sorting.

> Note: The frontend sends query params to the backend (`/admin/users`, `/admin/stores`). The backend validates sort fields to avoid server errors.

## 🧩 Backend notes & important gotchas
- The `UserEntity` in `Backend/api/src/entities/user.entity.ts` does not include a `createdAt` column by default. Sorting by `createdAt` for users will be ignored — the server uses a whitelist of sortable user fields (id, name, email, role).
- If you want to sort users by creation date, add a `CreateDateColumn()` to `UserEntity` and run migrations.

## 🔌 API quick reference
- GET /admin/dashboard — admin stats
- GET /admin/users?search=&sortBy=&order=&page=&limit=&role= — list users (pagination + role filter)
- GET /admin/stores?search=&sortBy=&order=&minRating=&maxRating=&page=&limit= — list stores (filters + pagination)
- POST /admin/add-user — add a user (admin action)
- POST /admin/add-shop — add shopowner and store (admin action)

Examples (frontend uses Axios):

```js
// fetch users
axios.get('/admin/users', { params: { search: 'john', sortBy: 'name', order: 'ASC', role: 'user' } })

// fetch stores with rating filters
axios.get('/admin/stores', { params: { minRating: 3, maxRating: 5 } })
```

## 🐞 Troubleshooting
- 500 errors when calling `/admin/users` often mean the backend attempted to sort or filter by a non-existent field. Ensure the frontend `sortBy` value is supported or add the field to the entity.
- Check backend logs (console) for stack traces.

## 🧪 Tests & quality
- Add unit/e2e tests in `Backend/api/test` and run them with the project's test scripts (if configured).

