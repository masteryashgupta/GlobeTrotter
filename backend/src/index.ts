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
import { shareRouter } from './routes/share';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS restricted to frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
app.use('/api/trips', tripsRouter);
app.use('/api/stops', stopsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/trip-activities', activitiesRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/share', shareRouter);
app.use('/api', expensesRouter);
app.use('/api/admin', adminRouter);


app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
