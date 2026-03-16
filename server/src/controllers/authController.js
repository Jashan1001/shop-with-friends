const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// --- Helper: generate both tokens ---
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN } // 15m
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // 7d
      jwtid: crypto.randomUUID(), // Ensure rotation always generates a distinct token
    }
  );

  return { accessToken, refreshToken };
};

// --- SIGNUP ---
exports.signup = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();

    // Check if email or username already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? 'email' : 'username';
      throw new ApiError(409, `This ${field} is already taken`);
    }

    // Create user — password gets hashed by the pre-save hook
    const user = await User.create({
      name: String(name).trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password,
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err); // Passes to global error handler in app.js
  }
};

// --- LOGIN ---
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();

    // Need +password because it has select:false on the model
    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Backward compatibility for legacy records with mixed-case email values.
    if (!user) {
      user = await User.findOne({
        email: {
          $regex: `^${escapeRegex(normalizedEmail)}$`,
          $options: 'i',
        },
      }).select('+password');
    }

    if (!user) {
      // Deliberately vague — don't tell attackers whether the email exists
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

// --- REFRESH TOKEN ---
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token required');
    }

    // Verify the token is cryptographically valid
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Also check it matches what's stored in DB
    // This is what lets logout actually work — we delete it from DB
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, 'Refresh token has been revoked');
    }

    // Issue new tokens (rotation — old refresh token is now invalid)
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

// --- LOGOUT ---
exports.logout = async (req, res, next) => {
  try {
    // req.user is set by auth middleware (built next)
    await User.findByIdAndUpdate(req.user.id, { refreshToken: '' });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

// --- GET ME ---
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name username email bio avatar createdAt');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};