/**
 * HackBridge Express Application Setup
 */

import express from 'express';
import cors from 'cors';
import { getDbStatus } from './config/db.js';
import { dataStore } from './repositories/dataStore.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/students.routes.js';
import teamRoutes from './routes/teams.routes.js';
import hackathonRoutes from './routes/hackathons.routes.js';
import mentorRoutes from './routes/mentors.routes.js';
import matchingPoolRoutes from './routes/matchingPool.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import ddbmsRoutes from './routes/ddbms.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (clean, excludes tokens)
app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    status: 'healthy',
    platform: 'HackBridge Platform API',
    version: '1.0.0',
    dataset: {
      loaded: dataStore.isLoaded,
      colleges: dataStore.colleges.size,
      students: dataStore.students.size,
      skills: dataStore.skills.size,
      hackathons: dataStore.hackathons.size,
      teams: dataStore.teams.size,
      mentors: dataStore.mentors.size,
      compatibility_records: dataStore.teamCompatibility.size,
    },
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/matching-pool', matchingPoolRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ddbms', ddbmsRoutes);
app.use('/api/admin', adminRoutes);

// Static frontend serving if dist exists
const distPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Catch 404 & Centralized Error Handler (for API)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
