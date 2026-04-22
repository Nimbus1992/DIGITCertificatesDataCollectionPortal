import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authMiddleware } from '../shared/middleware/auth';
import { errorHandler, notFoundHandler } from '../shared/middleware/error';

import organizationsRouter from '../services/organizations/routes';
import usersRouter from '../services/users/routes';
import formsRouter from '../services/forms/routes';
import workflowsRouter from '../services/workflows/routes';
import applicationsRouter from '../services/applications/routes';
import paymentsRouter from '../services/payments/routes';
import documentsRouter from '../services/documents/routes';
import notificationsRouter from '../services/notifications/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Global middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:8080', credentials: true }));
app.use(express.json());

// ── Health check (no auth) ───────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Authenticated routes ─────────────────────────────────────────
app.use('/api/v1', authMiddleware);
app.use('/api/v1/organizations', organizationsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/forms', formsRouter);
app.use('/api/v1/workflows', workflowsRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/documents', documentsRouter);
app.use('/api/v1/notifications', notificationsRouter);

// ── 404 + error handlers ─────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL}`);
});

export default app;
