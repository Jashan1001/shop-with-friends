require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Security headers (helmet sets 11 headers automatically)
app.use(helmet());

// Allow requests from your frontend
app.use(cors({ origin: process.env.CLIENT_URL }));

// Parse JSON request bodies
app.use(express.json());

// Log every request in dev: "POST /api/v1/auth/signup 201 45ms"
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check (important for Render.com cold starts later)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler — must have 4 params for Express to recognize it
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});
module.exports = app;
