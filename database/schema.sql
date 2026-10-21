-- =====================================================================
-- HACKBRIDGE MASTER DATABASE SCHEMA
-- Relational MySQL 8.0 schema for the inter-college hackathon platform
-- =====================================================================

CREATE DATABASE IF NOT EXISTS hackbridge_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hackbridge_db;

-- Disable foreign key checks during initial drop/create
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS matching_pool;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS mentorship_requests;
DROP TABLE IF EXISTS hackathon_applications;
DROP TABLE IF EXISTS team_invitations;
DROP TABLE IF EXISTS team_applications;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS team_hackathon_compatibility;
DROP TABLE IF EXISTS hackathon_participation;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS team_mentor_mapping;
DROP TABLE IF EXISTS mentor_skills;
DROP TABLE IF EXISTS mentors;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS hackathon_required_skills;
DROP TABLE IF EXISTS hackathons;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS colleges;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 1. COLLEGES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE colleges (
  college_id VARCHAR(50) PRIMARY KEY,
  college_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  college_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_colleges_state ON colleges(state);
CREATE INDEX idx_colleges_city ON colleges(city);

-- ---------------------------------------------------------------------
-- 2. SKILLS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE skills (
  skill_id VARCHAR(50) PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL UNIQUE,
  skill_category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_skills_category ON skills(skill_category);

-- ---------------------------------------------------------------------
-- 3. STUDENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  college_id VARCHAR(50) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  cgpa DECIMAL(4,2) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  primary_role VARCHAR(100) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  hackathons_participated INT DEFAULT 0,
  hackathons_won INT DEFAULT 0,
  projects_completed INT DEFAULT 0,
  github_available TINYINT(1) DEFAULT 0,
  portfolio_available TINYINT(1) DEFAULT 0,
  preferred_team_size INT DEFAULT 4,
  availability_hours_per_week INT DEFAULT 15,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_students_college ON students(college_id);
CREATE INDEX idx_students_role ON students(primary_role);
CREATE INDEX idx_students_exp ON students(experience_level);

-- ---------------------------------------------------------------------
-- 4. STUDENT_SKILLS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE student_skills (
  student_id VARCHAR(50) NOT NULL,
  skill_id VARCHAR(50) NOT NULL,
  proficiency_level VARCHAR(50) NOT NULL,
  experience_months INT DEFAULT 6,
  PRIMARY KEY (student_id, skill_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_student_skills_skill ON student_skills(skill_id);
CREATE INDEX idx_student_skills_prof ON student_skills(proficiency_level);

-- ---------------------------------------------------------------------
-- 5. HACKATHONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE hackathons (
  hackathon_id VARCHAR(50) PRIMARY KEY,
  hackathon_name VARCHAR(255) NOT NULL,
  organizer VARCHAR(255) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(50) NOT NULL,
  team_min_size INT NOT NULL DEFAULT 2,
  team_max_size INT NOT NULL DEFAULT 5,
  registration_deadline DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  prize_pool DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  experience_required VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hackathons_domain ON hackathons(domain);
CREATE INDEX idx_hackathons_mode ON hackathons(mode);
CREATE INDEX idx_hackathons_deadline ON hackathons(registration_deadline);
CREATE INDEX idx_hackathons_dates ON hackathons(start_date, end_date);

-- ---------------------------------------------------------------------
-- 6. HACKATHON_REQUIRED_SKILLS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE hackathon_required_skills (
  hackathon_id VARCHAR(50) NOT NULL,
  skill_id VARCHAR(50) NOT NULL,
  importance_weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (hackathon_id, skill_id),
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hrs_skill ON hackathon_required_skills(skill_id);

-- ---------------------------------------------------------------------
-- 7. TEAMS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE teams (
  team_id VARCHAR(50) PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  leader_student_id VARCHAR(50) NOT NULL,
  hackathon_id VARCHAR(50) NOT NULL,
  team_size INT NOT NULL DEFAULT 1,
  team_status VARCHAR(50) NOT NULL DEFAULT 'Forming',
  experience_score DECIMAL(6,2) DEFAULT 0.00,
  skill_diversity_score DECIMAL(6,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_student_id) REFERENCES students(student_id) ON DELETE RESTRICT,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_teams_hackathon ON teams(hackathon_id);
CREATE INDEX idx_teams_leader ON teams(leader_student_id);
CREATE INDEX idx_teams_status ON teams(team_status);

-- ---------------------------------------------------------------------
-- 8. TEAM_MEMBERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE team_members (
  team_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  assigned_role VARCHAR(100) NOT NULL,
  join_status VARCHAR(50) NOT NULL DEFAULT 'Accepted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, student_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_team_members_student ON team_members(student_id);
CREATE INDEX idx_team_members_status ON team_members(join_status);

-- ---------------------------------------------------------------------
-- 9. MENTORS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE mentors (
  mentor_id VARCHAR(50) PRIMARY KEY,
  mentor_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  years_of_experience INT NOT NULL DEFAULT 1,
  industry VARCHAR(100) NOT NULL,
  max_teams INT NOT NULL DEFAULT 3,
  rating DECIMAL(3,2) NOT NULL DEFAULT 4.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_mentors_spec ON mentors(specialization);
CREATE INDEX idx_mentors_industry ON mentors(industry);

-- ---------------------------------------------------------------------
-- 10. MENTOR_SKILLS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE mentor_skills (
  mentor_id VARCHAR(50) NOT NULL,
  skill_id VARCHAR(50) NOT NULL,
  proficiency_score DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  PRIMARY KEY (mentor_id, skill_id),
  FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_mentor_skills_skill ON mentor_skills(skill_id);

-- ---------------------------------------------------------------------
-- 11. TEAM_MENTOR_MAPPING TABLE
-- ---------------------------------------------------------------------
CREATE TABLE team_mentor_mapping (
  team_id VARCHAR(50) NOT NULL,
  mentor_id VARCHAR(50) NOT NULL,
  mentor_team_match_score DECIMAL(6,2) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (team_id, mentor_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tmm_mentor ON team_mentor_mapping(mentor_id);

-- ---------------------------------------------------------------------
-- 12. PROJECTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE projects (
  project_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_domain VARCHAR(100) NOT NULL,
  technology_stack TEXT,
  difficulty_level VARCHAR(50) NOT NULL,
  project_status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_projects_student ON projects(student_id);
CREATE INDEX idx_projects_domain ON projects(project_domain);

-- ---------------------------------------------------------------------
-- 13. HACKATHON_PARTICIPATION TABLE
-- ---------------------------------------------------------------------
CREATE TABLE hackathon_participation (
  participation_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  hackathon_id VARCHAR(50) NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  role VARCHAR(100) NOT NULL,
  result VARCHAR(50) NOT NULL,
  performance_score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  UNIQUE KEY uq_student_hackathon (student_id, hackathon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hp_student ON hackathon_participation(student_id);
CREATE INDEX idx_hp_hackathon ON hackathon_participation(hackathon_id);
CREATE INDEX idx_hp_result ON hackathon_participation(result);

-- ---------------------------------------------------------------------
-- 14. TEAM_HACKATHON_COMPATIBILITY TABLE
-- ---------------------------------------------------------------------
CREATE TABLE team_hackathon_compatibility (
  team_id VARCHAR(50) NOT NULL,
  hackathon_id VARCHAR(50) NOT NULL,
  skill_match_percentage DECIMAL(6,2) NOT NULL,
  experience_match_percentage DECIMAL(6,2) NOT NULL,
  domain_match_percentage DECIMAL(6,2) NOT NULL,
  team_completeness_percentage DECIMAL(6,2) NOT NULL,
  overall_compatibility_score DECIMAL(6,2) NOT NULL,
  recommended TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (team_id, hackathon_id),
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_thc_overall ON team_hackathon_compatibility(overall_compatibility_score);
CREATE INDEX idx_thc_recommended ON team_hackathon_compatibility(recommended);

-- ---------------------------------------------------------------------
-- 15. USERS (APPLICATION AUTHENTICATION)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'mentor', 'college', 'admin') NOT NULL DEFAULT 'student',
  profile_id VARCHAR(50),
  college_id VARCHAR(50),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ---------------------------------------------------------------------
-- 16. OPERATIONAL WORKFLOW TABLES
-- ---------------------------------------------------------------------
CREATE TABLE team_applications (
  id VARCHAR(50) PRIMARY KEY,
  team_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE team_invitations (
  id VARCHAR(50) PRIMARY KEY,
  team_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  invited_by VARCHAR(50) NOT NULL,
  message TEXT,
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hackathon_applications (
  id VARCHAR(50) PRIMARY KEY,
  hackathon_id VARCHAR(50) NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  applied_by VARCHAR(50) NOT NULL,
  project_title VARCHAR(255),
  status ENUM('pending', 'registered', 'rejected') DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mentorship_requests (
  id VARCHAR(50) PRIMARY KEY,
  mentor_id VARCHAR(50) NOT NULL,
  team_id VARCHAR(50) NOT NULL,
  requested_by VARCHAR(50) NOT NULL,
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  link VARCHAR(255),
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_unread ON notifications(user_id, is_read);

CREATE TABLE announcements (
  id VARCHAR(50) PRIMARY KEY,
  hackathon_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  pinned TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE matching_pool (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  hackathon_id VARCHAR(50),
  preferred_role VARCHAR(100),
  availability_hours INT DEFAULT 15,
  interests TEXT,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(hackathon_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_user ON audit_logs(user_id);
