# CartCrew 🛒

> Real-time collaborative shopping platform where friend groups create rooms, share products, vote on purchases, and decide together.

**Live Demo → [cart-crew.vercel.app](https://cart-crew.vercel.app)**

---

## What it does

CartCrew replaces the scattered WhatsApp link-sharing workflow that friend groups already use for shopping decisions. Create a room, add products, vote together, decide faster.

- 🏠 **Group Rooms** — Create a room for any shopping occasion
- 🗳️ **Real-time Voting** — Upvote or downvote products, counts update live
- 💬 **Per-product Comments** — Discuss each product in its own thread
- ⚡ **Live Updates** — Everything syncs via Socket.io, no refreshing needed
- 🔗 **Easy Invites** — Share a code or link, friends join in one click
- ✅ **Track Decisions** — Mark products as bought or skipped

---

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (Neo-Brutalism design system)
- Framer Motion (animations)
- Socket.io Client (real-time)
- React Query (server state + optimistic updates)
- Zustand (auth store)
- React Hook Form + Zod (validation)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (WebSocket server)
- JWT (access + refresh token rotation)
- bcryptjs, Helmet, express-rate-limit, Zod

**Deployment**
- Frontend → Vercel
- Backend → Railway
- Database → MongoDB Atlas

---

## Architecture highlights

**JWT access + refresh token rotation**
Access tokens expire in 15 minutes. Refresh tokens are stored in the DB and invalidated on logout. An Axios interceptor automatically refreshes expired tokens and retries the original request — users never see a forced logout.

**Real-time with Socket.io**
Every mutation follows REST-first then socket emit — data saves to MongoDB first, then the controller emits to the room. Clients never rely on optimistic socket emits. Socket connections require valid JWT on handshake; server verifies room membership before any join.

**Vote race condition prevention**
MongoDB compound unique index on `(productId, userId)` prevents double voting at the database level. Combined with atomic `$inc` operations, vote counts are always consistent under concurrent requests.

**N+1 query fix**
Product feed fetches all votes for a room in a single `$in` query instead of one query per product. Scales correctly as rooms grow.

**IDOR protection**
Every room-scoped route runs `isMember` middleware that verifies the requesting user is actually a member of that room before any operation proceeds.

---

## Running locally

**Prerequisites:** Node.js 18+, MongoDB Atlas account

**Backend**
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

**Frontend**
```bash
cd client
npm install
# Create .env with VITE_API_URL and VITE_SOCKET_URL
npm run dev
```

**Environment variables**

Server `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=64_char_random_string
JWT_REFRESH_SECRET=different_64_char_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
BCRYPT_ROUNDS=12
```

Client `.env`:
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

**Seed demo data**
```bash
cd server
npm run seed
# Creates two demo accounts and a pre-populated Laptops room
# demo1@cartcrew.app / Demo1234
# demo2@cartcrew.app / Demo1234
```

---

## Project structure

```
shop-with-friends/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios API calls
│   │   ├── components/     # UI components
│   │   ├── hooks/          # useSocket, useRoom
│   │   ├── pages/          # Route pages
│   │   ├── store/          # Zustand stores
│   │   └── utils/          # Helpers
└── server/                 # Node + Express backend
    └── src/
        ├── controllers/    # Route handlers
        ├── middleware/      # Auth, validation, rate limiting
        ├── models/         # Mongoose schemas
        ├── routes/         # Express routes
        └── socket/         # Socket.io handlers
```

---

## Interview talking points

- Implemented JWT access/refresh token rotation — access token expires in 15 minutes, refresh token stored in DB and rotated on each use, Axios interceptor handles refresh transparently
- Prevented double-voting using MongoDB compound unique index on `(productId, userId)` — race conditions handled at the database level, not application level
- Built Socket.io room auth middleware that verifies JWT on handshake and rejects connections before any room is joined
- Fixed N+1 query in product feed — batches all vote fetches in a single `$in` query
- React Query optimistic updates for instant vote feedback — rolls back automatically on API error
- REST-first then socket emit pattern — every mutation saves to DB before emitting, client updates are always backed by persisted data

---

Built with React + Node.js + Socket.io · Deployed on Vercel + Railway
