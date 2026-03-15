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