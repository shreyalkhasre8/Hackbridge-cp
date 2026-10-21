/**
 * HackBridge Notifications Routes
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, (req, res) => {
  const userId = req.user.profile_id || req.user.user_id;

  const notifs = dataStore.notifications
    .filter(n => n.user_id === userId || n.user_id === req.user.user_id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const unreadCount = notifs.filter(n => !n.is_read).length;

  res.json({
    success: true,
    data: notifs,
    unread_count: unreadCount,
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, (req, res) => {
  const notif = dataStore.notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });

  notif.is_read = 1;
  dataStore.persistOperationalData();

  res.json({ success: true, message: 'Marked as read', data: notif });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, (req, res) => {
  const userId = req.user.profile_id || req.user.user_id;

  dataStore.notifications.forEach(n => {
    if (n.user_id === userId || n.user_id === req.user.user_id) {
      n.is_read = 1;
    }
  });

  dataStore.persistOperationalData();

  res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
