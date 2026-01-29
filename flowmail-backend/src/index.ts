import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import automationRoutes from './routes/automations';

dotenv.config();

const app = express();
// Use a non-reserved port; 5000 is occupied by a Windows system process on your machine.
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/automations', automationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend (when built) so "/" doesn't 404 if you run only the backend.
// Expected build output: flow-automator/dist
const frontendDistPath = path.resolve(__dirname, '../../flow-automator/dist');
const frontendIndexHtml = path.join(frontendDistPath, 'index.html');
if (fs.existsSync(frontendIndexHtml)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback (must be after API routes)
  app.get('*', (req, res) => {
    res.sendFile(frontendIndexHtml);
  });
} else {
  // Helpful hint if someone visits "/" while running API-only server
  app.get('/', (req, res) => {
    res.status(200).json({
      message:
        'FlowMail backend is running. Start the frontend dev server in "flow-automator" (npm run dev) or build it (npm run build) to serve it from here.',
      health: '/health',
      api: {
        automations: '/api/automations',
      },
    });
  });
}

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

