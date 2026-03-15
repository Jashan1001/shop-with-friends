# CartCrew — Learnings

## Phase 1 — Foundation

### Why two JWTs (access + refresh)?
Access token is short-lived (15 min) — if stolen, expires fast.
Refresh token is long-lived (7 days) but stored in DB — can be revoked on logout.
This gives you both security AND good UX (users don't get logged out every 15 min).

### Why process.exit(1) if MongoDB fails?
The app can't function without a database. Letting it start without DB
would mean every request silently fails. Failing loud is better than failing quiet.

### What does middleware do?
Code that runs BETWEEN a request arriving and your route handler.
helmet() → cors() → express.json() → your route → response
Each one can modify req/res or end the request early (e.g. auth middleware rejects if no token).

### Always pin major versions when starting a project
npm installs the latest version by default. Express v5 is experimental
and breaks compatibility with many middlewares like express-rate-limit.
Always check what version you're getting with `npm list <package>`.
For stable projects, install with an explicit version:
npm install express@4.21.2

### Mongoose async pre hooks don't use next()
In older Mongoose you called next() to signal the hook was done.
In modern Mongoose, async pre hooks just return - Mongoose awaits
the function automatically. Passing next as a param and calling it
in an async hook throws "next is not a function".

### Zod v4 breaking change — err.errors moved to err.message
In Zod v3, validation issues were in err.errors (array).
In Zod v4, err.errors is undefined — issues are JSON-serialized
inside err.message as a string. Always check package versions when
a library's error shape doesn't match the docs.

### Always check which directory you're running commands from
Running npm run dev from shop-with-friends/ instead of shop-with-friends/server/
causes cascading weird errors. Your terminal prompt should always show
the correct folder before running any command.

### Same error message for wrong email vs wrong password
"Invalid email or password" for both cases intentionally.
If you say "email not found", an attacker learns which emails are registered.
Vague error messages = more secure auth.

### next(err) needs a 4-param error handler to catch it
Express only recognizes a function as an error handler if it has exactly
4 parameters — (err, req, res, next). 3 params and it's treated as
a regular middleware, so next(err) has nowhere to go.

### Vite env variables must start with VITE_
Vite strips any env variable that doesn't start with VITE_ for security.
VITE_API_URL works, API_URL does not. Also restart the dev server
after editing .env — Vite only reads it at startup.

### ES modules vs CommonJS
Vite projects use ES modules (import/export).
Node projects use CommonJS (require/module.exports).
Using module.exports in a Vite config file throws
"module is not defined". Always check which module
system a config file expects before writing it.

### Socket.io needs the raw HTTP server, not Express app
http.createServer(app) gives you the server explicitly.
app.listen() creates it internally and hides it.
Socket.io needs the raw server to attach to.

### REST first, then socket emit — always
Never emit a socket event without saving to DB first.
If the emit happens before save and the save fails,
users see data that doesn't exist. Save → emit → respond.

### Deduplicate socket + REST cache updates
When YOU add a product, both the REST response and the
socket event fire. Without a duplicate check in the socket
handler, the product appears twice. Always check if the
item already exists before adding to cache.

### Zod v4 breaking change — err.errors moved to err.message
In Zod v3, validation issues were in err.errors (array).
In Zod v4, err.errors is undefined — issues are JSON-serialized
inside err.message as a string. Always check package versions when
a library's error shape doesn't match the docs.

### Always check which directory you're running commands from
Running npm run dev from shop-with-friends/ instead of shop-with-friends/server/
causes cascading weird errors. Your terminal prompt should always show
the correct folder before running any command.

### Same error message for wrong email vs wrong password
"Invalid email or password" for both cases intentionally.
If you say "email not found", an attacker learns which emails are registered.
Vague error messages = more secure auth.

### next(err) needs a 4-param error handler to catch it
Express only recognizes a function as an error handler if it has exactly
4 parameters — (err, req, res, next). 3 params and it's treated as
a regular middleware, so next(err) has nowhere to go.

### Vite env variables must start with VITE_
Vite strips any env variable that doesn't start with VITE_ for security.
VITE_API_URL works, API_URL does not. Also restart the dev server
after editing .env — Vite only reads it at startup.

### ES modules vs CommonJS
Vite projects use ES modules (import/export).
Node projects use CommonJS (require/module.exports).
Using module.exports in a Vite config file throws
"module is not defined". Always check which module
system a config file expects before writing it.

### Socket.io needs the raw HTTP server, not Express app
http.createServer(app) gives you the server explicitly.
app.listen() creates it internally and hides it.
Socket.io needs the raw server to attach to.

### REST first, then socket emit — always
Never emit a socket event without saving to DB first.
If the emit happens before save and the save fails,
users see data that doesn't exist. Save → emit → respond.

### Deduplicate socket + REST cache updates
When YOU add a product, both the REST response and the
socket event fire. Without a duplicate check in the socket
handler, the product appears twice. Always check if the
item already exists before adding to cache.

### useEffect dependency arrays cause duplicate socket listeners
If a callback passed to a custom hook is recreated every render,
adding it to the dependency array causes the effect to re-run,
registering new listeners without removing old ones.
Fix: wrap callbacks in useCallback before passing them as deps.

### useRef prevents infinite re-renders in socket hooks
Storing the socket instance in useState causes re-renders every time
it changes. useRef holds the value without triggering re-renders.
For socket connections, always use useRef for the instance and only
call setSocket (Zustand) inside the connect event handler.

### Railway deployment — env vars not from .env file
Railway injects env vars directly into the process, not from a .env file.
dotenv injecting 0 variables is expected and correct on Railway.
If it says "undefined" for MONGODB_URI, the variable simply isn't
set in the Railway Variables tab — check there, not the file.

### trust proxy required for Railway and similar platforms
Railway sits behind a load balancer that adds X-Forwarded-For headers.
Express doesn't trust these by default, which breaks express-rate-limit.
Add app.set('trust proxy', 1) right after const app = express().

### Vercel client-side routing fix
Vercel serves static files and doesn't know about React Router routes.
Visiting /dashboard directly returns 404 unless you add vercel.json
with rewrites pointing all routes to index.html.

### Socket.io transports on cloud platforms
Some cloud platforms proxy HTTP and drop WebSocket upgrades.
Always configure transports: ['polling', 'websocket'] so Socket.io
starts with polling and upgrades to WebSocket when available.
Using only ['websocket'] silently fails on Railway and similar hosts.

### CORS on Socket.io is separate from Express CORS
app.use(cors()) only covers HTTP requests.
Socket.io has its own cors option in new Server(server, { cors: ... }).
Both must allow the same origins or socket connections will be blocked
even when regular API calls work fine.

### MongoDB Atlas IP whitelist blocks cloud deployments
Atlas defaults to only allowing whitelisted IPs.
For development and portfolio projects, set 0.0.0.0/0 in Network Access
to allow connections from Railway, Vercel, and any device.

### NODE_ENV must be production on deployed servers
Running NODE_ENV=development on Railway enables morgan logging
and may change error handling behavior. Always set NODE_ENV=production
in your cloud platform's environment variables.