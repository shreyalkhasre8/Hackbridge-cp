/**
 * HackBridge Administration & Moderation Routes
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/users
router.get('/users', authenticate, authorize(['admin']), (req, res) => {
  const usersList = Array.from(dataStore.users.values()).map(u => ({
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    role: u.role,
    profile_id: u.profile_id,
    college_id: u.college_id,
    created_at: u.created_at,
  }));

  res.json({
    success: true,
    data: usersList,
  });
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', authenticate, authorize(['admin']), (req, res) => {
  const { role } = req.body;
  if (!['student', 'mentor', 'college', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specified.' });
  }

  const user = Array.from(dataStore.users.values()).find(u => u.user_id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.role = role;
  dataStore.persistOperationalData();

  res.json({
    success: true,
    message: `Role updated to ${role}`,
    data: { user_id: user.user_id, role: user.role },
  });
});

// GET /api/admin/stats
router.get('/stats', authenticate, authorize(['admin']), (req, res) => {
  res.json({
    success: true,
    data: {
      registered_users: dataStore.users.size,
      active_teams: dataStore.teams.size,
      pending_team_applications: dataStore.teamApplications.filter(a => a.status === 'pending').length,
      pending_mentorship_requests: dataStore.mentorshipRequests.filter(r => r.status === 'pending').length,
      matching_pool_count: dataStore.matchingPool.size,
      total_notifications_sent: dataStore.notifications.length,
    },
  });
});

export default router;
