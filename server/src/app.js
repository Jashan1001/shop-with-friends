require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const { globalLimiter } = require('./middleware/rateLimiter');
const roomRoutes = require('./routes/roomRoutes');
const productRoutes = require('./routes/productRoutes');
const voteRoutes = require('./routes/voteRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://cart-crew.vercel.app',
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  ...(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const cartCrewVercelPreviewRegex = /^https:\/\/cart-crew(?:-[a-z0-9-]+)*\.vercel\.app$/i;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      cartCrewVercelPreviewRegex.test(origin);

    if (isAllowed) return callback(null, true);

    console.warn(`Blocked CORS origin: ${origin}`);
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

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/rooms/:roomId/products', productRoutes);
app.use('/api/v1/products/:id/vote', voteRoutes);
app.use('/api/v1/products/:id/comments', commentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api', globalLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});
app.get("/", (req, res) => {
  res.send("CartCrew Backend API is running ");
});

module.exports = app;