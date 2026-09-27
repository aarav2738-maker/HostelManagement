import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import complaintRoutes from './routes/complaints.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import messMenuRoutes from './routes/mess-menu.routes.js';
import roomRequestRoutes from './routes/room-requests.routes.js';
import roommateRoutes from './routes/roommate.routes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' })); // complaint images travel as data URLs

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/mess-menu', messMenuRoutes);
  app.use('/api/room-requests', roomRequestRoutes);
  app.use('/api/roommates', roommateRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
