import mongoose from 'mongoose';


export const connectDB = async (uri) => {
mongoose.set('strictQuery', true);
await mongoose.connect(uri, { dbName: 'rbac_booking' });
console.log('✅ MongoDB connected');
};