/**
 * HackBridge "I Don't Have A Team" Matching Pool Routes
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate } from '../middleware/auth.js';
import { matchStudentToPool } from '../services/teamFormationEngine.js';

const router = Router();

// POST /api/matching-pool/join
router.post('/join', authenticate, (req, res) => {
  const studentId = req.body.student_id || req.user.profile_id || 'STU0001';
  const {
    hackathon_id,
    preferred_role = 'Frontend Developer',
    availability_hours = 15,
    interests = '',
  } = req.body;

  const student = dataStore.students.get(studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student profile not found' });
  }

  const poolEntry = {
    id: `POOL_${Date.now()}`,
    student_id: studentId,
    student_name: student.student_name,
    college_id: student.college_id,
    college_name: dataStore.colleges.get(student.college_id)?.college_name || student.college_id,
    hackathon_id: hackathon_id || null,
    preferred_role,
    availability_hours: parseInt(availability_hours, 10),
    interests,
    active: 1,
    joined_at: new Date().toISOString(),
  };

  dataStore.matchingPool.set(studentId, poolEntry);
  dataStore.persistOperationalData();

  // Find complementary recommendations immediately
  const matches = matchStudentToPool(studentId);

  res.status(201).json({
    success: true,
    message: 'Successfully registered in the intelligent matching pool!',
    data: {
      pool_entry: poolEntry,
      recommendations: matches.recommended_teams,
    },
  });
});

// POST /api/matching-pool/leave
router.post('/leave', authenticate, (req, res) => {
  const studentId = req.body.student_id || req.user.profile_id;
  if (!studentId || !dataStore.matchingPool.has(studentId)) {
    return res.status(404).json({ success: false, message: 'Not currently in matching pool' });
  }

  dataStore.matchingPool.delete(studentId);
  dataStore.persistOperationalData();

  res.json({
    success: true,
    message: 'Removed from team matching pool.',
  });
});

// GET /api/matching-pool/status/:studentId
router.get('/status/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const inPool = dataStore.matchingPool.has(studentId);
  const entry = inPool ? dataStore.matchingPool.get(studentId) : null;

  let recommendations = [];
  if (dataStore.students.has(studentId)) {
    const matchResult = matchStudentToPool(studentId);
    recommendations = matchResult.recommended_teams;
  }

  res.json({
    success: true,
    data: {
      in_pool: inPool,
      entry,
      recommended_teams: recommendations,
    },
  });
});

// GET /api/matching-pool/all
router.get('/all', authenticate, (req, res) => {
  const list = Array.from(dataStore.matchingPool.values()).map(m => {
    const student = dataStore.students.get(m.student_id);
    const skills = student ? (dataStore.studentSkills.get(student.student_id) || []) : [];
    return {
      ...m,
      cgpa: student ? student.cgpa : null,
      skills: skills.slice(0, 4),
    };
  });

  res.json({
    success: true,
    data: list,
  });
});

export default router;
