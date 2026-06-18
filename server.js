import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import userRoutes from './routes/user.js';
import statsRoutes from './routes/stats.js';

// Middleware
import { authMiddleware } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Create data directory if not exists
if (!fs.existsSync(join(__dirname, 'data'))) {
  fs.mkdirSync(join(__dirname, 'data'), { recursive: true });
}

// Security Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') : '*',
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
app.use(rateLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', authMiddleware, configRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve Static Files (Client)
app.use(express.static(join(__dirname, 'client', 'dist')));

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DevTahaPanel running on port ${PORT}`);
  console.log(`📊 Visit http://localhost:${PORT}`);
});
