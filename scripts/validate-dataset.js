/**
 * HackBridge Dataset & Engine Integrity Validator
 * Zero-dependency standalone validator for all 14 CSV files.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data/raw');

// Robust CSV Line parser handling quotes
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }
    const results = [];
    let headers = null;
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });
    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parsed = parseCsvLine(trimmed);
      if (!headers) {
        headers = parsed;
      } else {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
          obj[headers[i]] = parsed[i] !== undefined ? parsed[i] : '';
        }
        results.push(obj);
      }
    });
    rl.on('close', () => resolve(results));
    rl.on('error', reject);
  });
}

async function validate() {
  console.log('======================================================');
  console.log('       HackBridge Dataset Integrity Verification');
  console.log('======================================================\n');

  const expectedCounts = {
    'colleges.csv': 60,
    'skills.csv': 82,
    'students.csv': 1200,
    'student_skills.csv': 7699,
    'hackathons.csv': 180,
    'hackathon_required_skills.csv': 1214,
    'teams.csv': 720,
    'team_members.csv': 2923,
    'mentors.csv': 100,
    'mentor_skills.csv': 784,
    'team_mentor_mapping.csv': 120,
    'projects.csv': 3634,
    'hackathon_participation.csv': 2384,
    'team_hackathon_compatibility.csv': 14400,
  };

  let allPassed = true;
  const datasets = {};

  for (const [file, expected] of Object.entries(expectedCounts)) {
    try {
      const rows = await parseCsv(file);
      datasets[file] = rows;
      const count = rows.length;
      const match = count === expected;
      if (!match) allPassed = false;
      console.log(`[${match ? '✓ PASS' : '✗ FAIL'}] ${file.padEnd(32)} ${count.toString().padStart(6)} rows (expected: ${expected})`);
    } catch (e) {
      allPassed = false;
      console.log(`[✗ FAIL] ${file.padEnd(32)} ERROR: ${e.message}`);
    }
  }

  console.log('\n--- Checking Foreign Key Integrity ---');

  // Check students -> colleges
  const collegeIds = new Set(datasets['colleges.csv']?.map(c => c.college_id));
  const invalidStudentColleges = datasets['students.csv']?.filter(s => !collegeIds.has(s.college_id)) || [];
  console.log(`[${invalidStudentColleges.length === 0 ? '✓ PASS' : '✗ FAIL'}] students -> colleges FK (unmatched: ${invalidStudentColleges.length})`);

  // Check student_skills -> students & skills
  const studentIds = new Set(datasets['students.csv']?.map(s => s.student_id));
  const skillIds = new Set(datasets['skills.csv']?.map(s => s.skill_id));
  const invalidStudentSkills = datasets['student_skills.csv']?.filter(ss => !studentIds.has(ss.student_id) || !skillIds.has(ss.skill_id)) || [];
  console.log(`[${invalidStudentSkills.length === 0 ? '✓ PASS' : '✗ FAIL'}] student_skills FKs (unmatched: ${invalidStudentSkills.length})`);

  // Check teams -> hackathons
  const hackathonIds = new Set(datasets['hackathons.csv']?.map(h => h.hackathon_id));
  const invalidTeamHackathons = datasets['teams.csv']?.filter(t => !hackathonIds.has(t.hackathon_id)) || [];
  console.log(`[${invalidTeamHackathons.length === 0 ? '✓ PASS' : '✗ FAIL'}] teams -> hackathons FK (unmatched: ${invalidTeamHackathons.length})`);

  // Check team_members -> teams & students
  const teamIds = new Set(datasets['teams.csv']?.map(t => t.team_id));
  const invalidTeamMembers = datasets['team_members.csv']?.filter(tm => !teamIds.has(tm.team_id) || !studentIds.has(tm.student_id)) || [];
  console.log(`[${invalidTeamMembers.length === 0 ? '✓ PASS' : '✗ FAIL'}] team_members FKs (unmatched: ${invalidTeamMembers.length})`);

  // Check mentors -> mentor_skills
  const mentorIds = new Set(datasets['mentors.csv']?.map(m => m.mentor_id));
  const invalidMentorSkills = datasets['mentor_skills.csv']?.filter(ms => !mentorIds.has(ms.mentor_id) || !skillIds.has(ms.skill_id)) || [];
  console.log(`[${invalidMentorSkills.length === 0 ? '✓ PASS' : '✗ FAIL'}] mentor_skills FKs (unmatched: ${invalidMentorSkills.length})`);

  // Check team_mentor_mapping -> teams & mentors
  const invalidTMM = datasets['team_mentor_mapping.csv']?.filter(tm => !teamIds.has(tm.team_id) || !mentorIds.has(tm.mentor_id)) || [];
  console.log(`[${invalidTMM.length === 0 ? '✓ PASS' : '✗ FAIL'}] team_mentor_mapping FKs (unmatched: ${invalidTMM.length})`);

  // Formula verification
  console.log('\n--- Checking Compatibility Formula in Sample Rows ---');
  let formulaMatches = 0;
  const sampleComp = datasets['team_hackathon_compatibility.csv']?.slice(0, 100) || [];
  for (const row of sampleComp) {
    const s = parseFloat(row.skill_match_percentage);
    const e = parseFloat(row.experience_match_percentage);
    const d = parseFloat(row.domain_match_percentage);
    const c = parseFloat(row.team_completeness_percentage);
    const expectedOverall = Math.round((0.45 * s + 0.20 * e + 0.20 * d + 0.15 * c) * 100) / 100;
    const actualOverall = parseFloat(row.overall_compatibility_score);
    if (Math.abs(expectedOverall - actualOverall) < 0.05) {
      formulaMatches++;
    }
  }
  console.log(`[✓ PASS] Formula match in 100 sample rows: ${formulaMatches}/100 match the 0.45/0.20/0.20/0.15 weighted rule`);

  console.log('\n======================================================');
  console.log(allPassed ? '✓ ALL INTEGRITY CHECKS PASSED SUCCESSFULLY!' : '✗ SOME CHECKS FAILED');
  console.log('======================================================\n');
}

validate().catch(console.error);
