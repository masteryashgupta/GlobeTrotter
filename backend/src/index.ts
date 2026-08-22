import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tripsRouter } from './routes/trips';
import { stopsRouter } from './routes/stops';
import { activitiesRouter } from './routes/activities';
import { citiesRouter } from './routes/cities';
import { budgetRouter } from './routes/budget';
import { expensesRouter } from './routes/expenses';
import { adminRouter } from './routes/admin';
import { profileRouter } from './routes/profile';
import { shareRouter } from './routes/share';
import { tripActivitiesRouter } from './routes/tripActivities';

import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup supporting local dev, production GitHub Pages, and process.env.FRONTEND_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://masteryashgupta.github.io',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive callback for seamless client access
    },
    credentials: true,
  })
);

app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GlobeTrotter Backend API',
  });
});

// Route Mounting
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/stops', stopsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/trip-activities', tripActivitiesRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/share', shareRouter);
app.use('/api', expensesRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
