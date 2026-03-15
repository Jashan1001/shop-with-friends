const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 chars, letters/numbers/underscores only'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // NEVER returned in queries unless explicitly asked
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [160, 'Bio cannot exceed 160 characters'],
    },
    rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
    refreshToken: {
      type: String,
      select: false, // Same as password — never expose this
    },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt
  }
);


// --- Pre-save hook: hash password before saving ---
userSchema.pre('save', async function () {
  // Only hash if password was actually changed (not on profile updates)
  if (!this.isModified('password')) return;

  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
});

// --- Instance method: compare passwords ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);