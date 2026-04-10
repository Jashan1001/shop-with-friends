require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const { globalLimiter, scrapeLimiter } = require('./middleware/rateLimiter')
const roomRoutes = require('./routes/roomRoutes');
const productRoutes = require('./routes/productRoutes');
const voteRoutes = require('./routes/voteRoutes');
const commentRoutes = require('./routes/commentRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const { scrapeUrl } = require('./controllers/productController');
const { protect } = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.set('trust proxy', 1);

const normalizeOrigin = (origin) =>
  typeof origin === 'string' ? origin.trim().replace(/\/$/, '') : origin

const allowedOrigins = [
  'http://localhost:5173',
  'https://cart-crew.vercel.app',
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]
  .map(normalizeOrigin)
  .filter(Boolean);

const cartCrewVercelPreviewRegex = /^https:\/\/cart-crew(?:-[a-z0-9-]+)*\.vercel\.app$/i;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin)

    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      cartCrewVercelPreviewRegex.test(normalizedOrigin);

    if (isAllowed) return callback(null, true);

    console.warn(`Blocked CORS origin: ${normalizedOrigin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', globalLimiter); // Rate limit all API routes — must be before any route handler
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
// Scrape must come BEFORE /:id routes to avoid Express matching "scrape" as an ID
app.post('/api/v1/products/scrape', scrapeLimiter, protect, scrapeUrl)
app.use('/api/v1/rooms/:roomId/products', productRoutes);
app.use('/api/v1/products/:id/vote', voteRoutes);
app.use('/api/v1/products/:id/comments', commentRoutes);
app.use('/api/v1/products/:id/reactions', reactionRoutes);
app.use('/api/v1/users', userRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const SENSITIVE_ERROR_PATTERN = /cloud_name|api_key|api_secret|mongodb\+srv|jwt_secret|jwt_refresh_secret|signature|credential/i;

function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') return 'Internal server error';

  if (SENSITIVE_ERROR_PATTERN.test(message)) {
    return 'Configuration error. Please contact support.';
  }

  return message;
}

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Only expose detailed client-facing messages for expected application errors.
  // For unexpected server errors, keep responses generic.
  const canExposeMessage = statusCode < 500;
  const message = canExposeMessage
    ? sanitizeErrorMessage(err.message)
    : 'Something went wrong. Please try again.';

  res.status(statusCode).json({
    success: false,
    message,
  });
});
app.get("/", (req, res) => {
  res.send("CartCrew Backend API is running ");
});

module.exports = app;