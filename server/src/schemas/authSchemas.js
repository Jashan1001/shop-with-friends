const { z } = require('zod');

const normalizeEmail = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z.string().email('Invalid email address')
);

const normalizeUsername = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscores')
);

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  username: normalizeUsername,
  email: normalizeEmail,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email: normalizeEmail,
  password: z.string().min(1, 'Password is required'),
});

module.exports = { signupSchema, loginSchema };