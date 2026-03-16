# CartCrew 🛒

> Real-time collaborative shopping platform. Create rooms, share products, vote together, decide faster.

**Live Demo → [cart-crew.vercel.app](https://cart-crew.vercel.app)**

```
Email:    demo1@cartcrew.app
Password: Demo1234
```

---

## What it does

CartCrew replaces scattered WhatsApp link-sharing threads that friend groups use for shopping decisions. Create a room, add products from any platform, vote together, and decide faster.

- 🏠 **Group Rooms** — Create a room for any shopping occasion, invite friends with a code
- 🗳️ **Real-time Voting** — Upvote or downvote products, counts update live via Socket.io
- 💬 **Per-product Comments** — Discuss each product in its own thread
- ⚡ **Live Updates** — Everything syncs instantly, no refreshing needed
- 🔗 **Easy Invites** — Share a code or link, one click to join
- ✅ **Track Decisions** — Mark products as bought or skipped
- 😍 **Reactions** — 6 emoji reactions per product with live burst animations
- 🔍 **URL Scraper** — Paste any product link to auto-fill title, price, platform

---

## Tech Stack

**Frontend**
- React 19 + Vite 8
- Tailwind CSS (Neo-Brutalism design system — zero border-radius, hard shadows, 8-color palette)
- Framer Motion 12 (animations)
- Socket.io Client 4 (real-time)
- React Query 5 (server state + optimistic updates)
- Zustand 5 (auth store)
- React Hook Form + Zod v4 (validation)
- DOMPurify (XSS protection on all user content)

**Backend**
- Node.js + Express 4
- MongoDB Atlas + Mongoose 9
- Socket.io 4 (WebSocket server)
- JWT (access 15m + refresh 7d with rotation)
- bcryptjs (cost factor 12)
- Helmet, express-rate-limit, Zod v4
- Multer + Cloudinary (avatar + product image uploads)
- Cheerio + Axios (URL scraper with SSRF protection)

**Testing**
- Jest + Supertest (8 test suites, 60+ tests)
- Tests: auth, rooms, products, votes, comments, reactions, scraper, security

**Deployment**
- Frontend → Vercel
- Backend → Railway
- Database → MongoDB Atlas
- Images → Cloudinary (free tier)
- CI → GitHub Actions (runs tests on every push)

---

## Architecture Highlights

### JWT access + refresh token rotation
Access tokens expire in 15 minutes. Refresh tokens are stored in the DB and invalidated on logout. An Axios interceptor automatically refreshes expired tokens and retries the original request — users never see a forced logout.

### Real-time with Socket.io
Every mutation follows REST-first then socket emit — data saves to MongoDB first, then the controller emits to the room. Clients never rely on optimistic socket emits. Socket connections require valid JWT on handshake; server verifies DB room membership before any `socket.join()`.

### Vote race condition prevention
MongoDB compound unique index on `(productId, userId)` prevents double voting at the database level under concurrent requests. Not application-level locking.

### N+1 query eliminated
Product feed fetches all votes for a room in a single `$in` query instead of one query per product. Scales correctly as rooms grow.

### IDOR protection
Every room-scoped route runs `isMember` or `isOwner` middleware that verifies the requesting user is actually a member of that specific room before any operation proceeds.

### SSRF protection on URL scraper
The scraper validates URLs are HTTPS-only, then DNS-resolves the hostname and blocks private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x) before making any outbound request.

### Cascade delete
Deleting a room cascades to Products → Votes, Comments, Reactions — no orphaned documents.

---

## Running Locally

**Prerequisites:** Node.js 20+, MongoDB Atlas account (free tier works)

### Backend
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values (see below)
npm run dev
```

### Frontend
```bash
cd client
npm install
# client/.env is already configured for localhost
npm run dev
```

### Environment Variables

**server/.env**
```
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cartcrew
MONGODB_URI_TEST=mongodb+srv://<user>:<password>@cluster.mongodb.net/cartcrew-test

JWT_SECRET=<64_char_random_string>
JWT_REFRESH_SECRET=<different_64_char_string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
CORS_ORIGINS=

CLOUDINARY_CLOUD_NAME=<from_cloudinary_dashboard>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

BCRYPT_ROUNDS=12
```

**client/.env** (already included)
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### Seed Demo Data
```bash
cd server
npm run seed
# Creates: demo1@cartcrew.app / Demo1234  |  demo2@cartcrew.app / Demo1234
# Pre-populated Laptops room with products, votes, and comments
```

### Run Tests
```bash
cd server
npm test
# Requires MONGODB_URI in server/.env
# Runs 8 test suites: auth, rooms, products, votes, comments, reactions, scraper, security
```

---

## Project Structure

```
cartcrew/
├── .github/
│   └── workflows/
│       └── test.yml              # CI: runs tests on push/PR
├── client/
│   └── src/
│       ├── api/                  # Axios API calls (7 files)
│       ├── animations/           # Framer Motion variants
│       ├── components/
│       │   ├── comments/         # CommentPanel, CommentList, CommentInput
│       │   ├── layout/           # AppLayout, Sidebar, MobileNav
│       │   ├── products/         # ProductCard, ProductFeed, AddProductModal,
│       │   │                     # VoteButtons, ReactionBar
│       │   ├── rooms/            # RoomCard, CreateRoomModal, InviteModal
│       │   └── ui/               # Button, Input, Badge, Avatar, Modal,
│       │                         # Toast, Skeleton, ErrorBoundary
│       ├── hooks/                # useAuth, useSocket, useRoom,
│       │                         # useDebounce, useProductScraper
│       ├── pages/                # LandingPage, LoginPage, SignupPage,
│       │                         # DashboardPage, RoomPage, ProfilePage,
│       │                         # JoinRoomPage
│       ├── store/                # authStore (Zustand), socketStore
│       └── utils/                # errorMessage, formatPrice, timeAgo, roomIcons
└── server/
    ├── __tests__/                # 8 test suites (60+ tests)
    └── src/
        ├── config/               # db.js, cloudinary.js
        ├── controllers/          # 7 controllers
        ├── middleware/           # auth, roomAuth, validate, rateLimiter, upload
        ├── models/               # User, Room, Product, Vote, Comment, Reaction
        ├── routes/               # 7 route files
        ├── schemas/              # Zod schemas (auth, room, product)
        ├── socket/               # socketAuth.js, socketHandlers.js
        └── utils/                # apiError, generateInviteCode,
                                  # scrapeMetadata (SSRF protected), seed
```

---

## Deployment

### Railway (Backend)

Set these environment variables in the Railway dashboard:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<atlas_production_uri>
JWT_SECRET=<64_char_secret>
JWT_REFRESH_SECRET=<different_64_char_secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://cart-crew.vercel.app
CORS_ORIGINS=https://cart-crew.vercel.app
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
BCRYPT_ROUNDS=12
```

### Vercel (Frontend)

Set these environment variables in Vercel project settings:
```
VITE_API_URL=https://your-railway-app.railway.app/api/v1
VITE_SOCKET_URL=https://your-railway-app.railway.app
```

The `client/vercel.json` is already configured to handle React Router client-side routing.

---

## Security Notes

- JWT tokens use short-lived access (15m) + long-lived refresh (7d) with DB revocation
- Refresh tokens are rotated on every use — stolen tokens have a one-use window
- All user input is validated with Zod on the server (req.body is replaced with parsed result)
- User-generated content (product titles, usernames, comments) is sanitized with DOMPurify before render
- SSRF protection on the URL scraper: HTTPS-only + DNS resolution check + private IP blocklist
- Rate limiting: auth endpoints (10/15min), username check (10/15min), all API routes (200/15min)
- Helmet.js sets security HTTP headers on all responses
- CORS is an explicit allowlist — all other origins are blocked

---

## Important Engineering Notes

- `trust proxy: 1` is set — required for Railway's load balancer to work correctly with rate limiting
- Socket.io uses `transports: ['polling', 'websocket']` — polling fallback for cloud platforms that drop WebSocket upgrades
- Vote deduplication is at the DB level (compound unique index) not the application level
- Socket events are scoped: `room:deleted` only redirects if the deleted room is the current room; `member:removed` only redirects the removed user, not everyone in the room
- Cascade delete: deleting a room removes all Products, Votes, Comments, and Reactions for that room

---

Built with React + Node.js + Socket.io · CartCrew v2.0
