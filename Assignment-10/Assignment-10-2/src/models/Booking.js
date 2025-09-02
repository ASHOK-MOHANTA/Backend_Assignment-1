import mongoose from 'mongoose';


const bookingSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
serviceName: { type: String, required: true, trim: true },
requestedAt: { type: Date, required: true }, // requested date & time
status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' }
}, { timestamps: true });


export default mongoose.model('Booking', bookingSchema);