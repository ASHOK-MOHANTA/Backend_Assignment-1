import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, index: true },
  type: { type: String, enum: ['access', 'refresh'], required: true },
  blacklistedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // optional: when this blacklist entry can be removed
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL if expiresAt set

export default mongoose.model('BlacklistedToken', blacklistedTokenSchema);
