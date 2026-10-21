/**
 * HackBridge Mentor Management & Recommendation Routes
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate } from '../middleware/auth.js';
import { calculateMentorTeamMatch } from '../services/mentorMatchingEngine.js';

const router = Router();

// GET /api/mentors
router.get('/', (req, res) => {
  const {
    specialization,
    industry,
    min_rating,
    available_only,
    search = '',
    page = 1,
    limit = 20,
  } = req.query;

  let results = Array.from(dataStore.mentors.values());

  if (specialization) {
    results = results.filter(m => m.specialization.toLowerCase() === specialization.toLowerCase());
  }

  if (industry) {
    results = results.filter(m => m.industry.toLowerCase() === industry.toLowerCase());
  }

  if (min_rating) {
    const r = parseFloat(min_rating);
    results = results.filter(m => m.rating >= r);
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(m =>
      m.mentor_name.toLowerCase().includes(q) ||
      m.specialization.toLowerCase().includes(q) ||
      m.industry.toLowerCase().includes(q)
    );
  }

  const enhanced = results.map(m => {
    const skills = dataStore.mentorSkills.get(m.mentor_id) || [];
    const assigned = Array.from(dataStore.teamMentorMapping.values())
      .flat()
      .filter(mapping => mapping.mentor_id === m.mentor_id).length;
    const acceptedRequests = dataStore.mentorshipRequests
      .filter(r => r.mentor_id === m.mentor_id && r.status === 'accepted').length;

    const currentTeams = assigned + acceptedRequests;
    const isAvailable = currentTeams < m.max_teams;

    return {
      ...m,
      skills: skills.slice(0, 5),
      current_teams: currentTeams,
      is_available: isAvailable,
    };
  });

  let finalResults = enhanced;
  if (available_only === 'true' || available_only === '1') {
    finalResults = finalResults.filter(m => m.is_available);
  }

  const total = finalResults.length;
  const p = parseInt(page, 10);
  const l = parseInt(limit, 10);
  const startIndex = (p - 1) * l;
  const paginated = finalResults.slice(startIndex, startIndex + l);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      total,
      page: p,
      limit: l,
      total_pages: Math.ceil(total / l),
    },
  });
});

// GET /api/mentors/:id
router.get('/:id', (req, res) => {
  const mentor = dataStore.mentors.get(req.params.id);
  if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });

  const skills = dataStore.mentorSkills.get(mentor.mentor_id) || [];
  const assigned = Array.from(dataStore.teamMentorMapping.values())
    .flat()
    .filter(mapping => mapping.mentor_id === mentor.mentor_id);

  const assignedTeams = assigned.map(a => {
    const team = dataStore.teams.get(a.team_id);
    return {
      team_id: a.team_id,
      team_name: team ? team.team_name : a.team_id,
      match_score: a.mentor_team_match_score,
      hackathon_name: team ? dataStore.hackathons.get(team.hackathon_id)?.hackathon_name : '',
    };
  });

  const pendingRequests = dataStore.mentorshipRequests
    .filter(r => r.mentor_id === mentor.mentor_id && r.status === 'pending')
    .map(r => {
      const team = dataStore.teams.get(r.team_id);
      return {
        ...r,
        team_name: team ? team.team_name : r.team_id,
      };
    });

  const isAvailable = assignedTeams.length < mentor.max_teams;

  res.json({
    success: true,
    data: {
      ...mentor,
      skills,
      assigned_teams: assignedTeams,
      pending_requests: pendingRequests,
      current_teams_count: assignedTeams.length,
      is_available: isAvailable,
    },
  });
});

// GET /api/mentors/match/:teamId (Ranked recommendations for team)
router.get('/match/:teamId', (req, res) => {
  const team = dataStore.teams.get(req.params.teamId);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

  const matches = [];
  for (const mentor of dataStore.mentors.values()) {
    try {
      const match = calculateMentorTeamMatch(mentor.mentor_id, team.team_id);
      matches.push(match);
    } catch (e) {
      // skip
    }
  }

  // Sort descending by match_score
  matches.sort((a, b) => b.match_score - a.match_score);

  res.json({
    success: true,
    data: matches.slice(0, 15),
  });
});

// POST /api/mentors/:id/request (Submit mentorship request)
router.post('/:id/request', authenticate, (req, res) => {
  const mentor = dataStore.mentors.get(req.params.id);
  if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });

  const { team_id, message = 'We would appreciate your mentorship on our hackathon project.' } = req.body;
  if (!team_id) return res.status(400).json({ success: false, message: 'Team ID is required.' });

  const team = dataStore.teams.get(team_id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  // Check capacity
  const matchInfo = calculateMentorTeamMatch(mentor.mentor_id, team.team_id);
  if (!matchInfo.is_available) {
    return res.status(400).json({
      success: false,
      message: `Mentor has reached maximum capacity (${mentor.max_teams} teams). Please select another mentor.`,
    });
  }

  // Check duplicate pending request
  const existing = dataStore.mentorshipRequests.find(
    r => r.mentor_id === mentor.mentor_id && r.team_id === team_id && r.status === 'pending'
  );
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'A mentorship request for this mentor is already pending.',
    });
  }

  const newRequest = {
    id: `MREQ_${Date.now()}`,
    mentor_id: mentor.mentor_id,
    team_id,
    requested_by: req.user.user_id,
    message,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  dataStore.mentorshipRequests.push(newRequest);

  // Add notification for mentor
  dataStore.notifications.push({
    id: `NOTIF_${Date.now()}`,
    user_id: mentor.mentor_id,
    title: 'New Mentorship Request',
    message: `Team "${team.team_name}" requested your mentorship.`,
    type: 'mentorship_request',
    link: `/mentor/dashboard`,
    is_read: 0,
    created_at: new Date().toISOString(),
  });

  dataStore.persistOperationalData();

  res.status(201).json({
    success: true,
    message: 'Mentorship request sent successfully!',
    data: newRequest,
  });
});

// POST /api/mentors/requests/:requestId/decision
router.post('/requests/:requestId/decision', authenticate, (req, res) => {
  const { decision } = req.body; // 'accepted' | 'rejected'
  const request = dataStore.mentorshipRequests.find(r => r.id === req.params.requestId);
  if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

  const mentor = dataStore.mentors.get(request.mentor_id);
  const team = dataStore.teams.get(request.team_id);

  if (decision === 'accepted') {
    // Enforce capacity check
    const match = calculateMentorTeamMatch(mentor.mentor_id, team.team_id);
    if (!match.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept request: maximum team capacity reached.',
      });
    }

    request.status = 'accepted';

    // Add to team mentor mappings
    if (!dataStore.teamMentorMapping.has(team.team_id)) {
      dataStore.teamMentorMapping.set(team.team_id, []);
    }
    dataStore.teamMentorMapping.get(team.team_id).push({
      mentor_id: mentor.mentor_id,
      mentor_team_match_score: match.match_score,
    });
  } else {
    request.status = 'rejected';
  }

  // Notify team leader
  dataStore.notifications.push({
    id: `NOTIF_${Date.now()}`,
    user_id: team ? team.leader_student_id : request.requested_by,
    title: `Mentorship Request ${decision === 'accepted' ? 'Accepted' : 'Declined'}`,
    message: `${mentor.mentor_name} has ${decision} your mentorship request.`,
    type: decision === 'accepted' ? 'mentorship_accepted' : 'mentorship_declined',
    link: `/teams/${request.team_id}`,
    is_read: 0,
    created_at: new Date().toISOString(),
  });

  dataStore.persistOperationalData();

  res.json({
    success: true,
    message: `Mentorship request ${decision}.`,
    data: request,
  });
});

export default router;
