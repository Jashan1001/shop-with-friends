# Shop With Friends — Learnings

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