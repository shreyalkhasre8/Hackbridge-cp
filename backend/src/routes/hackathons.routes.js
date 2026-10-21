/**
 * HackBridge Hackathon Management & Explainable Recommendation Routes
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { calculateCompatibility } from '../services/compatibilityEngine.js';

const router = Router();

// GET /api/hackathons
router.get('/', (req, res) => {
  const {
    domain,
    mode,
    difficulty,
    search = '',
    upcoming_only,
    page = 1,
    limit = 20,
  } = req.query;

  let results = Array.from(dataStore.hackathons.values());
  const today = new Date().toISOString().split('T')[0];

  if (upcoming_only === 'true' || upcoming_only === '1') {
    results = results.filter(h => h.registration_deadline >= today);
  }

  if (domain) {
    results = results.filter(h => h.domain.toLowerCase() === domain.toLowerCase());
  }

  if (mode) {
    results = results.filter(h => h.mode.toLowerCase() === mode.toLowerCase());
  }

  if (difficulty) {
    results = results.filter(h => h.difficulty_level.toLowerCase() === difficulty.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(h =>
      h.hackathon_name.toLowerCase().includes(q) ||
      h.organizer.toLowerCase().includes(q) ||
      h.city.toLowerCase().includes(q) ||
      h.domain.toLowerCase().includes(q)
    );
  }

  const total = results.length;
  const p = parseInt(page, 10);
  const l = parseInt(limit, 10);
  const startIndex = (p - 1) * l;
  const paginated = results.slice(startIndex, startIndex + l);

  const enhanced = paginated.map(h => {
    const reqSkills = dataStore.hackathonRequiredSkills.get(h.hackathon_id) || [];
    // Count teams targeting this hackathon
    const targetingTeams = Array.from(dataStore.teams.values()).filter(t => t.hackathon_id === h.hackathon_id);
    const isDeadlinePassed = h.registration_deadline < today;

    return {
      ...h,
      required_skills: reqSkills.slice(0, 5),
      teams_registered_count: targetingTeams.length,
      is_open: !isDeadlinePassed,
    };
  });

  res.json({
    success: true,
    data: enhanced,
    pagination: {
      total,
      page: p,
      limit: l,
      total_pages: Math.ceil(total / l),
    },
  });
});

// GET /api/hackathons/:id
router.get('/:id', (req, res) => {
  const hackathon = dataStore.hackathons.get(req.params.id);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found' });

  const requiredSkills = dataStore.hackathonRequiredSkills.get(hackathon.hackathon_id) || [];
  const announcements = dataStore.announcements.filter(a => a.hackathon_id === hackathon.hackathon_id);
  const registeredTeams = Array.from(dataStore.teams.values())
    .filter(t => t.hackathon_id === hackathon.hackathon_id)
    .slice(0, 10)
    .map(t => ({
      team_id: t.team_id,
      team_name: t.team_name,
      team_size: t.team_size,
      team_status: t.team_status,
    }));

  const today = new Date().toISOString().split('T')[0];
  const isDeadlinePassed = hackathon.registration_deadline < today;

  res.json({
    success: true,
    data: {
      ...hackathon,
      required_skills: requiredSkills,
      announcements,
      registered_teams: registeredTeams,
      is_open: !isDeadlinePassed,
    },
  });
});

// POST /api/hackathons (Create - Organizer/Admin)
router.post('/', authenticate, authorize(['college', 'admin']), (req, res) => {
  const {
    hackathon_name,
    organizer,
    mode = 'Online',
    city = 'Mumbai',
    state = 'Maharashtra',
    domain = 'Artificial Intelligence',
    difficulty_level = 'Intermediate',
    team_min_size = 2,
    team_max_size = 5,
    registration_deadline,
    start_date,
    end_date,
    prize_pool = 100000,
    experience_required = 'Intermediate',
    required_skills = [],
  } = req.body;

  if (!hackathon_name || !registration_deadline || !start_date || !end_date) {
    return res.status(400).json({
      success: false,
      message: 'Name, registration deadline, start date, and end date are required.',
    });
  }

  const hackathonId = `HACK_${Date.now().toString().slice(-5)}`;
  const newHackathon = {
    hackathon_id: hackathonId,
    hackathon_name,
    organizer: organizer || req.user.name || 'HackBridge College Cell',
    mode,
    city,
    state,
    domain,
    difficulty_level,
    team_min_size: parseInt(team_min_size, 10),
    team_max_size: parseInt(team_max_size, 10),
    registration_deadline,
    start_date,
    end_date,
    prize_pool: parseFloat(prize_pool) || 0,
    experience_required,
    created_at: new Date().toISOString(),
  };

  dataStore.hackathons.set(hackathonId, newHackathon);

  // Store required skills
  if (Array.isArray(required_skills)) {
    dataStore.hackathonRequiredSkills.set(
      hackathonId,
      required_skills.map(s => ({
        skill_id: s.skill_id,
        skill_name: s.skill_name || s.skill_id,
        importance_weight: parseFloat(s.importance_weight) || 1.0,
      }))
    );
  }

  dataStore.persistOperationalData();

  res.status(201).json({
    success: true,
    message: 'Hackathon created and published successfully!',
    data: newHackathon,
  });
});

// GET /api/hackathons/:id/compatibility/:teamId
router.get('/:id/compatibility/:teamId', (req, res) => {
  try {
    const result = calculateCompatibility(req.params.teamId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// POST /api/hackathons/:id/announcements
router.post('/:id/announcements', authenticate, authorize(['college', 'admin']), (req, res) => {
  const { title, content, pinned = 0 } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  const announcement = {
    id: `ANN_${Date.now()}`,
    hackathon_id: req.params.id,
    title,
    content,
    author: req.user.name || 'Event Coordinator',
    pinned: pinned ? 1 : 0,
    created_at: new Date().toISOString(),
  };

  dataStore.announcements.unshift(announcement);
  dataStore.persistOperationalData();

  res.status(201).json({
    success: true,
    message: 'Announcement published successfully!',
    data: announcement,
  });
});

// POST /api/hackathons/:id/apply (Team Registration)
router.post('/:id/apply', authenticate, (req, res) => {
  const { team_id, project_title } = req.body;
  if (!team_id) {
    return res.status(400).json({ success: false, message: 'Team ID is required.' });
  }

  const team = dataStore.teams.get(team_id);
  const hackathon = dataStore.hackathons.get(req.params.id);

  if (!team || !hackathon) {
    return res.status(404).json({ success: false, message: 'Team or hackathon not found.' });
  }

  // Evaluate Eligibility
  const compatibility = calculateCompatibility(team_id, req.params.id);
  if (!compatibility.is_eligible) {
    return res.status(400).json({
      success: false,
      message: 'Team does not satisfy event eligibility criteria.',
      eligibility_issues: compatibility.eligibility_issues,
    });
  }

  // Register application
  const app = {
    id: `HAPP_${Date.now()}`,
    hackathon_id: hackathon.hackathon_id,
    team_id: team.team_id,
    applied_by: req.user.user_id,
    project_title: project_title || team.team_name,
    status: 'registered',
    created_at: new Date().toISOString(),
  };

  dataStore.hackathonApplications.push(app);
  team.team_status = 'Registered';
  team.hackathon_id = hackathon.hackathon_id;
  dataStore.teams.set(team.team_id, team);

  dataStore.persistOperationalData();

  res.status(201).json({
    success: true,
    message: 'Team successfully registered for the hackathon!',
    data: app,
  });
});

export default router;
