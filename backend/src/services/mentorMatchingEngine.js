/**
 * HackBridge Mentor Matching Engine
 * Implements the documented mentor suitability model:
 * Mentor match = 0.65 * weighted_skill_proficiency + 0.25 * domain_fit + 0.10 * normalized_rating
 * - Domain fit = 100 for exact specialization match, 20 otherwise
 * - Normalized rating = rating * 20 (rating out of 5 -> 0-100)
 * - Enforces mentor capacity (assigned teams < max_teams)
 */

import { dataStore } from '../repositories/dataStore.js';

export function calculateMentorTeamMatch(mentorId, teamId) {
  const mentor = dataStore.mentors.get(mentorId);
  const team = dataStore.teams.get(teamId);

  if (!mentor || !team) {
    throw new Error(`Mentor (${mentorId}) or Team (${teamId}) not found`);
  }

  const hackathon = dataStore.hackathons.get(team.hackathon_id);
  const requiredSkills = hackathon
    ? (dataStore.hackathonRequiredSkills.get(hackathon.hackathon_id) || [])
    : [];

  const mentorSkills = dataStore.mentorSkills.get(mentorId) || [];
  const mentorSkillMap = new Map(mentorSkills.map(s => [s.skill_id, s.proficiency_score]));

  // 1. SKILL PROFICIENCY (65%)
  let totalReqWeight = 0;
  let weightedProfSum = 0;
  const skillMatches = [];

  for (const req of requiredSkills) {
    const weight = req.importance_weight || 1.0;
    totalReqWeight += weight;
    const prof = mentorSkillMap.get(req.skill_id) || 0; // 0 to 1
    weightedProfSum += prof * weight;
    skillMatches.push({
      skill_id: req.skill_id,
      skill_name: req.skill_name || req.skill_id,
      mentor_proficiency: Math.round(prof * 100),
      importance: weight,
    });
  }

  // If no required skills on event, fallback to overall mentor skill proficiency
  let skillProfPercentage = 75;
  if (totalReqWeight > 0) {
    skillProfPercentage = Math.round((weightedProfSum / totalReqWeight) * 10000) / 100;
  } else if (mentorSkills.length > 0) {
    const avgProf = mentorSkills.reduce((acc, s) => acc + s.proficiency_score, 0) / mentorSkills.length;
    skillProfPercentage = Math.round(avgProf * 10000) / 100;
  }

  // 2. DOMAIN FIT (25%)
  const targetDomain = hackathon ? hackathon.domain : '';
  const isExactDomain =
    targetDomain &&
    mentor.specialization.toLowerCase().includes(targetDomain.toLowerCase()) ||
    targetDomain.toLowerCase().includes(mentor.specialization.toLowerCase());

  const domainFit = isExactDomain ? 100 : 20;

  // 3. NORMALIZED RATING (10%)
  const normalizedRating = Math.min(100, Math.round(mentor.rating * 20 * 100) / 100);

  // OVERALL SCORE
  const matchScore = Math.round(
    (0.65 * skillProfPercentage + 0.25 * domainFit + 0.10 * normalizedRating) * 100
  ) / 100;

  // Check Mentor Capacity
  const assignedMappings = Array.from(dataStore.teamMentorMapping.values())
    .flat()
    .filter(m => m.mentor_id === mentorId);
  const activeRequests = dataStore.mentorshipRequests
    .filter(r => r.mentor_id === mentorId && r.status === 'accepted');

  const currentTeams = assignedMappings.length + activeRequests.length;
  const isAvailable = currentTeams < mentor.max_teams;

  // Plain-English Explanations
  const reasons = [];
  if (isExactDomain) {
    reasons.push(`Direct domain specialization in ${mentor.specialization}.`);
  } else {
    reasons.push(`Cross-domain expertise from ${mentor.industry} (${mentor.specialization}).`);
  }

  if (skillProfPercentage >= 70) {
    reasons.push(`High proficiency overlap with team's required technology stack (${skillProfPercentage}%).`);
  } else {
    reasons.push(`Broader technical coaching covering core architecture and delivery.`);
  }

  if (mentor.rating >= 4.5) {
    reasons.push(`Top-rated mentor with ${mentor.rating}/5.0 student satisfaction rating.`);
  }

  if (!isAvailable) {
    reasons.push(`Mentor has reached maximum capacity (${mentor.max_teams} teams).`);
  }

  return {
    mentor_id: mentorId,
    mentor_name: mentor.mentor_name,
    specialization: mentor.specialization,
    industry: mentor.industry,
    years_of_experience: mentor.years_of_experience,
    rating: mentor.rating,
    match_score: matchScore,
    skill_proficiency_score: skillProfPercentage,
    domain_fit_score: domainFit,
    normalized_rating: normalizedRating,
    current_teams: currentTeams,
    max_teams: mentor.max_teams,
    is_available: isAvailable,
    reasons,
    skill_matches: skillMatches,
  };
}
