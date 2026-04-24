# CartCrew 🛒

Real-time collaborative platform for group shopping decisions — built to handle consistency, concurrency, and secure user interactions.

🔗 **Live:** https://cart-crew.vercel.app  
🔗 **Code:** https://github.com/Jashan1001/shop-with-friends  

Email: demo1@cartcrew.app  
Password: Demo1234  

---

## 🧠 Problem

Group shopping today happens in scattered chats with no structure.

CartCrew enables shared decision-making in real time — combining voting, discussion, and synchronized state across users.

---

## ⚙️ Engineering Highlights

- REST-first + WebSocket consistency model  
- JWT access + refresh token rotation with revocation  
- MongoDB compound index for race-condition-safe voting  
- IDOR protection via room-scoped authorization middleware  
- SSRF-protected URL scraper with DNS + private IP blocking  
- N+1 query elimination using batched `$in` queries  

---

## 🚀 Features

- 🏠 **Group Rooms** — Create rooms and invite friends  
- 🗳️ **Real-time Voting** — Upvote/downvote with live updates  
- 💬 **Per-product Comments** — Dedicated discussion threads  
- ⚡ **Live Sync** — No refresh required  
- 🔗 **Easy Invites** — Join via link or code  
- ✅ **Decision Tracking** — Mark products as bought/skipped  
- 😍 **Reactions** — Emoji reactions with live updates  
- 🔍 **URL Scraper** — Auto-fetch product metadata  

---

## 🧱 Tech Stack

### Frontend
- React 19 + Vite  
- Tailwind CSS  
- Framer Motion  
- Socket.io Client  
- React Query  
- Zustand  
- React Hook Form + Zod  
- DOMPurify  

### Backend
- Node.js + Express  
- MongoDB Atlas + Mongoose  
- Socket.io  
- JWT (access + refresh rotation)  
- bcryptjs  
- Helmet, express-rate-limit  
- Multer + Cloudinary  
- Cheerio + Axios  

### Testing
- Jest + Supertest  
- 60+ tests (auth, rooms, products, voting, scraper, security)  

### Deployment
- Frontend → Vercel  
- Backend → Render
- Database → MongoDB Atlas  
- Images → Cloudinary  
- CI → GitHub Actions  

---

## ⚙️ Architecture Highlights

### JWT Authentication
- Access token (15m) + refresh token (7d)  
- Refresh tokens stored in DB with rotation  
- Axios interceptor handles silent refresh  

### Real-time System
- REST-first → DB write → socket emit  
- No optimistic socket-only updates  
- JWT validated on socket handshake  
- Room membership verified before join  

### Concurrency Handling
- MongoDB compound index `(productId, userId)`  
- Prevents duplicate votes under concurrent requests  

### Query Optimization
- Eliminated N+1 queries using `$in` batching  
- Scales with increasing room size  

### Security

- **IDOR Protection** → Room-scoped authorization middleware  
- **SSRF Protection** → HTTPS-only + DNS resolution + private IP blocking  
- **Input Validation** → Zod-based schema validation  
- **Sanitization** → DOMPurify for user content  
- **Rate Limiting** → API + auth endpoints  
- **Security Headers** → Helmet.js  

### Data Integrity
- Cascade delete: Rooms → Products → Votes → Comments → Reactions  
- No orphaned documents  

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+  
- MongoDB Atlas  

---

### Backend
```bash
cd server  
npm install  
cp .env.example .env  
npm run dev  
```
---

### Frontend
```bash
cd client  
npm install  
npm run dev  
```
---

## 🔐 Environment Variables

### server/.env

PORT=5000  
NODE_ENV=development  

MONGODB_URI=  

JWT_SECRET=  
JWT_REFRESH_SECRET=  
JWT_EXPIRES_IN=15m  
JWT_REFRESH_EXPIRES_IN=7d  

CLIENT_URL=http://localhost:5173  

CLOUDINARY_CLOUD_NAME=  
CLOUDINARY_API_KEY=  
CLOUDINARY_API_SECRET=  

BCRYPT_ROUNDS=12  

---

## 🧪 Testing

cd server  
npm test  

- 8 test suites  
- Covers auth, rooms, products, voting, comments, scraper, security  

---

## 📂 Project Structure
```
cartcrew/  
├── client/  
├── server/  
├── .github/workflows/  
└── ...  
```
---

## 📦 Deployment

### Backend (Render)

Set environment variables:
- MONGODB_URI  
- JWT_SECRET  
- JWT_REFRESH_SECRET  
- Cloudinary config  
- CORS origins  

### Frontend (Vercel)

VITE_API_URL=  
VITE_SOCKET_URL=  

---

## 🧠 Engineering Notes

- - `trust proxy: 1` required for proxy-based deployments (Render)
- Socket.io uses polling + websocket fallback  
- Vote deduplication handled at DB level  
- Socket events scoped per room  
- Only affected users are redirected on events  

---

## 🔐 Security Summary

- JWT rotation with revocation  
- SSRF protection in scraper  
- IDOR-safe authorization  
- Rate limiting and headers  
- Input validation + sanitization  

---

Built with React + Node.js + Socket.io · CartCrew v2.0