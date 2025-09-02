import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import contentRoutes from './routes/content.routes.js';
import { startExpiryJob } from './jobs/subscriptionExpiryJob.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('Subscription RBAC API is running'));

app.use('/auth', authRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/content', contentRoutes);

const PORT = process.env.PORT || 4000;

const start = async () => {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`🚀 Server started at http://localhost:${PORT}`));

  // start cron job (cron expression from env or fallback)
  const cronExpr = process.env.CRON_EXPIRE_CHECK || '0 * * * *'; // default hourly
  startExpiryJob(cronExpr);
};

start();
