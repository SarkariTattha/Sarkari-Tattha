import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './src/server/routes/auth';
import serviceRoutes from './src/server/routes/services';
import applicationRoutes from './src/server/routes/applications';
import paymentRoutes from './src/server/routes/payments';
import expenseRoutes from './src/server/routes/expenses';
import appointmentRoutes from './src/server/routes/appointments';
import adminRoutes from './src/server/routes/admin';
import centerPhotoRoutes from './src/server/routes/centerPhotos';
import { getDb } from './src/server/db';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB asynchronously
  await getDb();

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Serve uploaded documents
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/center-photos', centerPhotoRoutes);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Catch-all for unhandled /api/* routes (returns JSON instead of falling through to SPA HTML)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CSC + CSP Service Center Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
});
