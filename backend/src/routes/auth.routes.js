/**
 * HackBridge Authentication Routes
 */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hackbridge_jwt_secret_change_me_in_production_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
      profile_id: user.profile_id,
      college_id: user.college_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', college_id, branch, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (dataStore.users.has(cleanEmail)) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = `USR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let profileId = null;
    if (role === 'student') {
      profileId = `STU_${Date.now().toString().slice(-4)}`;
      // Create student entry in data store
      dataStore.students.set(profileId, {
        student_id: profileId,
        student_name: name,
        college_id: college_id || 'COL001',
        branch: branch || 'Computer Science',
        year: parseInt(year, 10) || 3,
        cgpa: 8.5,
        city: 'Mumbai',
        state: 'Maharashtra',
        primary_role: 'Full Stack Developer',
        experience_level: 'Intermediate',
        hackathons_participated: 0,
        hackathons_won: 0,
        projects_completed: 0,
        github_available: 1,
        portfolio_available: 0,
        preferred_team_size: 4,
        availability_hours_per_week: 15,
      });
    }

    const newUser = {
      user_id: userId,
      name,
      email: cleanEmail,
      password_hash,
      role,
      profile_id: profileId,
      college_id: college_id || (role === 'student' ? 'COL001' : null),
      created_at: new Date().toISOString(),
    };

    dataStore.users.set(cleanEmail, newUser);
    dataStore.persistOperationalData();

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile_id: newUser.profile_id,
        college_id: newUser.college_id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = dataStore.users.get(cleanEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_id: user.profile_id,
        college_id: user.college_id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/demo-login
// 1-Click login for testing student, mentor, organizer, and admin personas
router.post('/demo-login', async (req, res, next) => {
  try {
    const { role = 'student' } = req.body;
    const roleEmailMap = {
      student: 'student@hackbridge.edu',
      mentor: 'mentor@hackbridge.edu',
      college: 'organizer@hackbridge.edu',
      organizer: 'organizer@hackbridge.edu',
      admin: 'admin@hackbridge.edu',
    };

    const targetEmail = roleEmailMap[role] || roleEmailMap.student;
    const user = dataStore.users.get(targetEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo account for role "${role}" not configured.`,
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Signed in as Demo ${user.role.toUpperCase()}`,
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_id: user.profile_id,
        college_id: user.college_id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = dataStore.users.get(req.user.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    let profileDetails = null;
    if (user.role === 'student' && user.profile_id) {
      profileDetails = dataStore.students.get(user.profile_id);
    } else if (user.role === 'mentor' && user.profile_id) {
      profileDetails = dataStore.mentors.get(user.profile_id);
    } else if (user.role === 'college' && user.college_id) {
      profileDetails = dataStore.colleges.get(user.college_id);
    }

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_id: user.profile_id,
        college_id: user.college_id,
        profile: profileDetails,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
