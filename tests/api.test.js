/**
 * HackBridge REST API Route Integration Tests
 * Runs with Node.js built-in test runner: node --test tests/api.test.js
 */

import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../backend/src/app.js';
import { dataStore } from '../backend/src/repositories/dataStore.js';

let server;
let baseUrl;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

test('HackBridge REST API Integration Tests', async (t) => {
  await dataStore.init();

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });

  t.after(() => {
    server.close();
  });

  await t.test('GET /api/health returns 200 with dataset stats', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.strictEqual(res.body.dataset.students, 1200);
    assert.strictEqual(res.body.dataset.hackathons, 180);
    assert.strictEqual(res.body.dataset.colleges, 60);
  });

  await t.test('POST /api/auth/demo-login logs in student persona', async () => {
    const res = await request('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'student' },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'student');
  });

  await t.test('POST /api/auth/demo-login logs in admin persona', async () => {
    const res = await request('/api/auth/demo-login', {
      method: 'POST',
      body: { role: 'admin' },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.role, 'admin');
  });

  await t.test('GET /api/students returns paginated real students', async () => {
    const res = await request('/api/students?limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 5);
    assert.strictEqual(res.body.pagination.total, 1200);
  });

  await t.test('GET /api/hackathons returns real hackathons', async () => {
    const res = await request('/api/hackathons?limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 5);
    assert.strictEqual(res.body.pagination.total, 180);
  });

  await t.test('GET /api/teams returns real teams', async () => {
    const res = await request('/api/teams?limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 5);
    assert.strictEqual(res.body.pagination.total, 720);
  });

  await t.test('GET /api/mentors returns real mentors', async () => {
    const res = await request('/api/mentors?limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.length, 5);
    assert.strictEqual(res.body.pagination.total, 100);
  });

  await t.test('GET /api/analytics/overview returns calculated platform stats', async () => {
    const res = await request('/api/analytics/overview');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.total_students, 1200);
    assert.strictEqual(res.body.data.total_hackathons, 180);
    assert.ok(res.body.data.total_prize_pool_inr > 0);
  });

  await t.test('GET /api/ddbms/cluster returns 3 nodes', async () => {
    const res = await request('/api/ddbms/cluster');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.nodes.length, 3);
  });
});
