/**
 * HackBridge Database Connection Manager
 * Initializes a MySQL connection pool using mysql2/promise.
 * Gracefully provides health checks and diagnostic status.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let pool = null;
let isConnected = false;
let lastError = null;

export function initPool() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'hackbridge_db';

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    });

    // Test connectivity
    pool.getConnection()
      .then((conn) => {
        isConnected = true;
        lastError = null;
        console.log(`[Database] Successfully connected to MySQL pool on ${host}:${port}/${database}`);
        conn.release();
      })
      .catch((err) => {
        isConnected = false;
        lastError = err.message;
        console.warn(`[Database] MySQL pool initialized, but connection failed (${err.code || err.message}). Operating with loaded dataset repository.`);
      });
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn(`[Database] Could not create MySQL pool: ${err.message}. Using dataset repository fallback.`);
  }

  return pool;
}

export function getPool() {
  if (!pool) {
    initPool();
  }
  return pool;
}

export function getDbStatus() {
  return {
    connected: isConnected,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'hackbridge_db',
    user: process.env.DB_USER || 'root',
    error: lastError,
  };
}
