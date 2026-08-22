import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tripsRouter } from './routes/trips';
import { stopsRouter } from './routes/stops';
import { activitiesRouter } from './routes/activities';
import { citiesRouter } from './routes/cities';
import { budgetRouter } from './routes/budget';
import { expensesRouter } from './routes/expenses';
import { communityRouter } from './routes/community';
import { adminRouter } from './routes/admin';
import { profileRouter } from './routes/profile';
import { shareRouter } from './routes/share';
import { tripActivitiesRouter } from './routes/tripActivities';

import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true, // Echo back incoming origin dynamically (supports credentials + gh-pages + local dev)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.options('*', cors()); // Enable pre-flight for all routes

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
app.use('/api/trips/:tripId/expenses', expensesRouter);
app.use('/api/community', communityRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/share', shareRouter);
app.use('/api', expensesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cities', citiesRouter);

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
