import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
passwordHash: { type: String, required: true },
role: { type: String, enum: ['user', 'admin'], default: 'user' },
// Store exactly one active refresh token (rotate on login)
refreshToken: { type: String, default: null },
refreshTokenExpiresAt: { type: Date, default: null },
}, { timestamps: true });


export default mongoose.model('User', userSchema);