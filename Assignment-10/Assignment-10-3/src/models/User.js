import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // subscription fields kept on user for simplicity
  subscriptionPlan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
  subscriptionActive: { type: Boolean, default: false }, // true for premium/pro active
  subscriptionExpiresAt: { type: Date, default: null },

  // current refresh token (simple rotation)
  refreshToken: { type: String, default: null },
  refreshTokenExpiresAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
