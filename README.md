# OneCDC — Frontend (Next.js + MongoDB)

Mobile-first web app using **Next.js (App Router)**, **Tailwind**, **NextAuth (MongoDB adapter)**, and **Zustand** for cart state.

## Features (Lab 3 scope)

- **User Management**: register, sign in/out, protected routes via NextAuth (+ middleware).
- **Cart**: add shops from search, deduplicate by shop, **append item tags** if the same shop is added again, select/unselect shops, remove entries (Zustand + persisted storage).
- **Pages**:
  - `/sign-in` — sign in with email/password
  - `/register` — create account
  - `/cart` — protected cart page
  - `/account` — profile & password change

---

## Prerequisites

- Node.js **18+** (or 20+)
- npm (or pnpm/yarn)
- A MongoDB Atlas cluster (free M0 is fine)

> If you previously used a Postgres-based template, ensure any Drizzle/Postgres code is removed/disabled. This app runs on **MongoDB**.

---

## 1) Environment Variables

Create a file **`.env.local`** in the project root:

```bash
MONGODB_URI="mongodb+srv://<user>:<ENCODED_PASS>@<cluster>/<db>?retryWrites=true&w=majority"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<32+ char random string>"
```

all the files should be there without configuring
only thing need to change in mongodb url under .env.local, make a free atlas mongodb to connect
npm install
npm run dev

# open http://localhost:3000
