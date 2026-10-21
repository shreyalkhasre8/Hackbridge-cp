/**
 * HackBridge Automated Tests
 * Runs with Node.js built-in test runner: node --test tests/engine.test.js
 */

import test from 'node:test';
import assert from 'node:assert';
import { dataStore } from '../backend/src/repositories/dataStore.js';
import { calculateCompatibility } from '../backend/src/services/compatibilityEngine.js';
import { calculateMentorTeamMatch } from '../backend/src/services/mentorMatchingEngine.js';
import { analyzeTeamCompleteness } from '../backend/src/services/teamFormationEngine.js';
import { ddbmsService } from '../backend/src/services/ddbmsService.js';

test('HackBridge Core Engines Test Suite', async (t) => {
  // Initialize data store
  await dataStore.init();

  await t.test('DataStore correctly loads all 14 datasets', () => {
    assert.strictEqual(dataStore.colleges.size, 60, 'Colleges count should be 60');
    assert.strictEqual(dataStore.skills.size, 82, 'Skills count should be 82');
    assert.strictEqual(dataStore.students.size, 1200, 'Students count should be 1200');
    assert.strictEqual(dataStore.hackathons.size, 180, 'Hackathons count should be 180');
    assert.strictEqual(dataStore.teams.size, 720, 'Teams count should be 720');
    assert.strictEqual(dataStore.mentors.size, 100, 'Mentors count should be 100');
    assert.strictEqual(dataStore.teamCompatibility.size, 14400, 'Compatibility count should be 14400');
  });

  await t.test('Hackathon Compatibility Engine matches documented formula', () => {
    // Pick an existing team and hackathon
    const sampleTeam = Array.from(dataStore.teams.values())[0];
    const sampleHackathon = dataStore.hackathons.get(sampleTeam.hackathon_id);

    assert.ok(sampleTeam, 'Team should exist');
    assert.ok(sampleHackathon, 'Hackathon should exist');

    const result = calculateCompatibility(sampleTeam.team_id, sampleHackathon.hackathon_id);

    // Verify formula
    const calculated =
      0.45 * result.skill_match_percentage +
      0.20 * result.experience_match_percentage +
      0.20 * result.domain_match_percentage +
      0.15 * result.team_completeness_percentage;

    const rounded = Math.round(calculated * 100) / 100;
    assert.strictEqual(result.overall_compatibility_score, rounded, 'Overall score must equal weighted formula sum');

    if (result.overall_compatibility_score >= 70) {
      assert.strictEqual(result.recommended, 1, 'Score >= 70 must be recommended');
    } else {
      assert.strictEqual(result.recommended, 0, 'Score < 70 must not be recommended');
    }
  });

  await t.test('Eligibility check flags expired deadlines or invalid size', () => {
    // Past event
    const pastHackathon = Array.from(dataStore.hackathons.values())
      .find(h => h.registration_deadline < '2026-10-01');

    if (pastHackathon) {
      const sampleTeam = Array.from(dataStore.teams.values())[0];
      const result = calculateCompatibility(sampleTeam.team_id, pastHackathon.hackathon_id);
      assert.strictEqual(result.is_eligible, false, 'Expired hackathon must be marked ineligible');
      assert.ok(result.eligibility_issues.length > 0, 'Must provide plain-English eligibility issue');
    }
  });

  await t.test('Mentor Matching Engine follows 65% skill, 25% domain, 10% rating', () => {
    const sampleMentor = Array.from(dataStore.mentors.values())[0];
    const sampleTeam = Array.from(dataStore.teams.values())[0];

    const match = calculateMentorTeamMatch(sampleMentor.mentor_id, sampleTeam.team_id);

    const calculated = Math.round(
      (0.65 * match.skill_proficiency_score + 0.25 * match.domain_fit_score + 0.10 * match.normalized_rating) * 100
    ) / 100;

    assert.strictEqual(match.match_score, calculated, 'Mentor match must equal weighted formula');
    assert.ok(match.reasons.length > 0, 'Must provide explanation reasons');
  });

  await t.test('Team Completeness Engine detects missing roles and skills', () => {
    const sampleTeam = Array.from(dataStore.teams.values())[0];
    const analysis = analyzeTeamCompleteness(sampleTeam.team_id);

    assert.ok(analysis.completeness_score >= 0 && analysis.completeness_score <= 100);
    assert.ok(Array.isArray(analysis.missing_roles));
    assert.ok(Array.isArray(analysis.covered_roles));
  });

  await t.test('DDBMS Service executes distributed queries across simulated college nodes', async () => {
    const cluster = ddbmsService.getClusterStatus();
    assert.strictEqual(cluster.nodes.length, 3, 'Must simulate 3 college nodes');

    // Test UNION query
    const unionRes = await ddbmsService.executeDistributedQuery('union', { skill: 'Python' });
    assert.strictEqual(unionRes.fragments_queried.length, 3, 'Union query must query all 3 fragments');
    assert.ok(unionRes.total_rows > 0, 'Should find Python students across nodes');

    // Test Aggregate query
    const aggRes = await ddbmsService.executeDistributedQuery('aggregate');
    assert.strictEqual(aggRes.results.length, 3, 'Aggregate must return 3 node totals');
  });
});
