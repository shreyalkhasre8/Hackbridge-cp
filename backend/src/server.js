/**
 * HackBridge Backend Server Entry Point
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { initPool } from './config/db.js';
import { dataStore } from './repositories/dataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  console.log('========================================================');
  console.log('       HACKBRIDGE FULL-STACK REST API BACKEND');
  console.log('========================================================\n');

  // 1. Initialize MySQL Connection Pool
  initPool();

  // 2. Initialize In-Memory Relational Dataset & Operational Store
  await dataStore.init();

  // 3. Start Express Server
  app.listen(PORT, () => {
    console.log(`\n✓ HackBridge REST API is live on: http://localhost:${PORT}`);
    console.log(`✓ Health Check: http://localhost:${PORT}/api/health`);
    console.log(`✓ DDBMS Cluster Status: http://localhost:${PORT}/api/ddbms/cluster`);
    console.log(`\nDemo Credentials (Password: Demo@123):`);
    console.log(`  - Student:   student@hackbridge.edu`);
    console.log(`  - Mentor:    mentor@hackbridge.edu`);
    console.log(`  - Organizer: organizer@hackbridge.edu`);
    console.log(`  - Admin:     admin@hackbridge.edu\n`);
  });
}

// Graceful termination
process.on('SIGINT', () => {
  console.log('\nShutting down HackBridge API gracefully...');
  dataStore.persistOperationalData();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down HackBridge API gracefully...');
  dataStore.persistOperationalData();
  process.exit(0);
});

startServer().catch((err) => {
  console.error('Fatal error starting HackBridge server:', err);
  process.exit(1);
});
