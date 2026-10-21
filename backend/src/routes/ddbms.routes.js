/**
 * HackBridge Distributed Database Management System (DDBMS) Simulation Routes
 */

import { Router } from 'express';
import { ddbmsService } from '../services/ddbmsService.js';

const router = Router();

// GET /api/ddbms/cluster
router.get('/cluster', (req, res) => {
  const cluster = ddbmsService.getClusterStatus();
  res.json({ success: true, data: cluster });
});

// POST /api/ddbms/query
router.post('/query', async (req, res, next) => {
  try {
    const { query_type = 'union', params = {} } = req.body;
    const result = await ddbmsService.executeDistributedQuery(query_type, params);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
