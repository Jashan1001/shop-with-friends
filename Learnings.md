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
### multer-storage-cloudinary needs cloudinary v2, not v3
multer-storage-cloudinary uses cloudinary.v2 internally.
Import as: const cloudinary = require('cloudinary').v2
If you import the root cloudinary object directly, config doesn't persist
and uploads fail silently with "cloud_name required" errors.

### Multer file goes to req.file, not req.body
After multer middleware runs, the uploaded file is at req.file.path (Cloudinary URL)
and req.file.mimetype. The text fields from the same multipart form are in req.body.
Don't look for the file in req.body — it won't be there.

### FormData for file uploads — don't set Content-Type manually
When sending FormData with axios, do NOT set 'Content-Type': 'multipart/form-data' yourself.
Let axios set it automatically — it needs to include the boundary string
(e.g. multipart/form-data; boundary=----...) which only axios knows.
Setting the header manually breaks the upload.

### FileReader for instant avatar preview before upload completes
Use FileReader.readAsDataURL(file) to show a local preview immediately.
The user sees their new avatar right away while the upload happens in the background.
If the upload fails, revert the preview to the previous URL.

### useDebounce prevents API spam on every keypress
Without debouncing, a username check fires on every character typed.
useDebounce(value, 400) delays the effect until 400ms after the user stops typing.
This means one API call instead of one per keystroke — critical for availability checks.

### Check username availability before form submission too
The submit button should be disabled if usernameAvailable === false.
Without this, a user can type a taken username, ignore the "taken" indicator, and submit.
The server will catch it but the UX is better if the button itself prevents submission.

### Password strength feedback must be non-blocking
The strength indicator is cosmetic — it should never block form submission on its own.
Only the Zod schema (min 8 chars, uppercase, number) enforces real requirements.
The strength bar is feedback, not a gate.

---

## Phase 2 — Audit, Security & Real-World Bugs

### Express middleware order is load-bearing
app.use() middleware runs in the exact order it is registered.
A rate limiter registered AFTER routes never executes — every route
already sent a response by the time the limiter is reached.
Rule: security middleware (rate limiters, auth guards) ALWAYS goes
before route handlers.

### Mongoose ObjectId vs string comparison
After .populate(), a relation field becomes a JS object with an _id property.
Comparing it to a plain string with === always returns false.
Always use .toString() or String() when comparing Mongoose ObjectIds to strings:
room.createdBy?._id?.toString() === user?.id

### Socket.io emit to room hits ALL members — scope your client-side handlers
When the server emits to a room channel (io.to('room:123').emit(...)),
every member of that Socket.io room receives the event.
Client-side handlers must check the payload's userId/roomId against the
current user/room before acting — otherwise all users get redirected
when one user is removed.

### Mass assignment via { ...req.body } is a real attack vector
Even with Zod validation stripping unknown keys, passing { ...req.body }
to findByIdAndUpdate is fragile — schema changes or middleware bypass
can expose critical fields like roomId, addedBy, createdBy.
Always destructure only the fields you intend to update:
const { title, price } = req.body  // then pass only these

### SSRF: never trust user-supplied URLs for server-side fetching
The scrapeMetadata endpoint takes a URL from user input and makes an
outbound HTTP request. Without validation, an attacker can supply
http://169.254.169.254 (AWS metadata) or http://localhost:5432 (internal DB).
Fix: (1) HTTPS only, (2) DNS-resolve the hostname, (3) block private IP ranges.
Always validate before fetching, not after.

### Cascade deletes must be explicit in MongoDB
MongoDB has no foreign key constraints. When you delete a Room, the associated
Products, Votes, Comments, and Reactions are NOT automatically removed.
You must write explicit deleteMany() calls for each related collection.
Orphaned documents waste storage and cause reference errors over time.

### React Error Boundaries must be class components
React's getDerivedStateFromError and componentDidCatch lifecycle methods
are only available in class components. Function components cannot be
error boundaries. You need at least one class component in a React project
to handle render errors gracefully.

### Emoji validation must be an allowlist on the server
The client may show a picker with only valid emojis, but anyone can hit
the API directly with arbitrary strings. Always validate emoji fields
against an explicit allowlist using z.enum() — never rely on client-side
restriction alone.

### Rate limit public endpoints that reveal private data
The username availability check endpoint was public and unthrottled.
At 200 req/15min, an attacker could enumerate 800+ usernames per hour.
Any public endpoint that reveals information about registered users
(existence, availability, profile) should have strict rate limiting
or require authentication.

### Zod .url() + .refine() for URL fields
To safely validate a URL field in a Zod schema:
link: z.string()
  .url('Must be a valid URL')
  .refine(u => u.startsWith('https://'), 'Must use HTTPS')
  .optional()
This prevents javascript:, data:, http:, and ftp: scheme attacks in href attributes.
DOMPurify sanitizes innerHTML but NOT href — always validate URLs at the schema level.

### React components that wrap the whole app must be class-based for error catching
ErrorBoundary wraps <App /> in main.jsx. If any component inside the tree
throws during render, getDerivedStateFromError catches it and shows a
fallback screen instead of a blank white page. This is the only place
you need a class component in a modern React app.

### Test environment should skip non-essential external service validation
The Cloudinary config throws at startup if credentials are placeholders.
This is correct for production but breaks test runs which don't need Cloudinary.
Check process.env.NODE_ENV === 'test' and skip the validation.
Always make your app testable without requiring every external service.

### Null-check after findByIdAndUpdate when you act on the result
findByIdAndUpdate returns null if no document matched — it does not throw.
If you call .toString() or access a field on the result without checking,
you get a TypeError crash with a 500 instead of a clean 404.
Always add: if (!doc) throw new ApiError(404, 'Not found') immediately after.

---

## Phase 3 — CI/CD and Workflow Hygiene

### Split CI by domain (client vs server)
Keeping frontend and backend checks in separate workflows makes Actions history
easier to read and debug. A failed server test no longer hides client lint/build,
and each pipeline can evolve independently.

### Use path filters to avoid unnecessary workflow runs
Large repos should not run all pipelines on every commit.
Client workflow should watch client/**, server workflow should watch server/**.
Also include each workflow file path in its own filter so workflow changes still execute.

### Add concurrency cancellation for fast feedback on active branches
When multiple commits are pushed quickly, older runs become stale.
Use concurrency with cancel-in-progress: true to automatically cancel outdated runs
and keep only the newest run per branch/ref.

### Keep secrets only where needed
Only the server test workflow needs sensitive environment secrets.
Client lint/build should stay secret-free to reduce risk and simplify maintenance.

