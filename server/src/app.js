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

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cart-crew.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());

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