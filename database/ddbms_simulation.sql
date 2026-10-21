-- =====================================================================
-- HACKBRIDGE DDBMS SIMULATION: THREE COLLEGE NODES
-- Demonstrates horizontal fragmentation, replication & distributed queries
-- Node A: college_COL001_db (IIT Bombay)
-- Node B: college_COL002_db (IIT Delhi)
-- Node C: college_COL003_db (BITS Pilani)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CREATE THREE COLLEGE FRAGMENT SCHEMAS
-- ---------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS college_COL001_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS college_COL002_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS college_COL003_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. NODE A (IIT BOMBAY) FRAGMENT SCHEMA & DATA
-- ---------------------------------------------------------------------
USE college_COL001_db;

DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS replicated_skills;
DROP TABLE IF EXISTS replicated_hackathons;

-- Replicated Reference Data (Full read replication on all nodes)
CREATE TABLE replicated_skills (
  skill_id VARCHAR(50) PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(100) NOT NULL
);

CREATE TABLE replicated_hackathons (
  hackathon_id VARCHAR(50) PRIMARY KEY,
  hackathon_name VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  registration_deadline DATE NOT NULL
);

-- Horizontally Fragmented Data for College COL001
CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  college_id VARCHAR(50) NOT NULL DEFAULT 'COL001',
  branch VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  cgpa DECIMAL(4,2) NOT NULL,
  primary_role VARCHAR(100) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  availability_hours_per_week INT DEFAULT 15,
  looking_for_team TINYINT(1) DEFAULT 1
);

CREATE TABLE student_skills (
  student_id VARCHAR(50) NOT NULL,
  skill_id VARCHAR(50) NOT NULL,
  proficiency_level VARCHAR(50) NOT NULL,
  PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE teams (
  team_id VARCHAR(50) PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  leader_student_id VARCHAR(50) NOT NULL,
  hackathon_id VARCHAR(50) NOT NULL,
  team_size INT DEFAULT 1,
  team_status VARCHAR(50) DEFAULT 'Forming'
);

CREATE TABLE team_members (
  team_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  assigned_role VARCHAR(100) NOT NULL,
  join_status VARCHAR(50) DEFAULT 'Accepted',
  PRIMARY KEY (team_id, student_id)
);

CREATE TABLE projects (
  project_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_domain VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(50) NOT NULL
);

-- ---------------------------------------------------------------------
-- 3. NODE B (IIT DELHI) FRAGMENT SCHEMA & DATA
-- ---------------------------------------------------------------------
USE college_COL002_db;

DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS replicated_skills;
DROP TABLE IF EXISTS replicated_hackathons;

CREATE TABLE replicated_skills (
  skill_id VARCHAR(50) PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(100) NOT NULL
);

CREATE TABLE replicated_hackathons (
  hackathon_id VARCHAR(50) PRIMARY KEY,
  hackathon_name VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  registration_deadline DATE NOT NULL
);

CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  college_id VARCHAR(50) NOT NULL DEFAULT 'COL002',
  branch VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  cgpa DECIMAL(4,2) NOT NULL,
  primary_role VARCHAR(100) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  availability_hours_per_week INT DEFAULT 15,
  looking_for_team TINYINT(1) DEFAULT 1
);

CREATE TABLE student_skills (
  student_id VARCHAR(50) NOT NULL,
  skill_id VARCHAR(50) NOT NULL,
  proficiency_level VARCHAR(50) NOT NULL,
  PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE teams (
  team_id VARCHAR(50) PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  leader_student_id VARCHAR(50) NOT NULL,
  hackathon_id VARCHAR(50) NOT NULL,
  team_size INT DEFAULT 1,
  team_status VARCHAR(50) DEFAULT 'Forming'
);

CREATE TABLE team_members (
  team_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  assigned_role VARCHAR(100) NOT NULL,
  join_status VARCHAR(50) DEFAULT 'Accepted',
  PRIMARY KEY (team_id, student_id)
);

CREATE TABLE projects (
  project_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_domain VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(50) NOT NULL
);

-- ---------------------------------------------------------------------
-- 4. NODE C (BITS PILANI) FRAGMENT SCHEMA & DATA
-- ---------------------------------------------------------------------
USE college_COL003_db;

DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS student_skills;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS replicated_skills;
DROP TABLE IF EXISTS replicated_hackathons;

CREATE TABLE replicated_skills (
  skill_id VARCHAR(50) PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(100) NOT NULL
);

CREATE TABLE replicated_hackathons (
  hackathon_id VARCHAR(50) PRIMARY KEY,
  hackathon_name VARCHAR(255) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  registration_deadline DATE NOT NULL
);

CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  college_id VARCHAR(50) NOT NULL DEFAULT 'COL003',
  branch VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  cgpa DECIMAL(4,2) NOT NULL,
  primary_role VARCHAR(100) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  availability_hours_per_week INT DEFAULT 15,
  looking_for_team TINYINT(1) DEFAULT 1
);

CREATE TABLE student_skills (
  student_id VARCHAR(50) NOT NULL,
  skill_id VARCHAR(50) NOT NULL,
  proficiency_level VARCHAR(50) NOT NULL,
  PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE teams (
  team_id VARCHAR(50) PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  leader_student_id VARCHAR(50) NOT NULL,
  hackathon_id VARCHAR(50) NOT NULL,
  team_size INT DEFAULT 1,
  team_status VARCHAR(50) DEFAULT 'Forming'
);

CREATE TABLE team_members (
  team_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  assigned_role VARCHAR(100) NOT NULL,
  join_status VARCHAR(50) DEFAULT 'Accepted',
  PRIMARY KEY (team_id, student_id)
);

CREATE TABLE projects (
  project_id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  project_domain VARCHAR(100) NOT NULL,
  difficulty_level VARCHAR(50) NOT NULL
);

-- =====================================================================
-- 5. REPRESENTATIVE DISTRIBUTED QUERIES FOR DEMONSTRATION
-- =====================================================================

-- Query 1: Local Fragment Query (IIT Bombay only)
-- SELECT student_name, branch, primary_role FROM college_COL001_db.students WHERE primary_role = 'AI/ML Engineer';

-- Query 2: Distributed Inter-College Union Query (Find Frontend Devs across all 3 nodes)
-- SELECT 'IIT Bombay' AS node, student_name, branch, primary_role FROM college_COL001_db.students WHERE primary_role = 'Frontend Developer'
-- UNION ALL
-- SELECT 'IIT Delhi' AS node, student_name, branch, primary_role FROM college_COL002_db.students WHERE primary_role = 'Frontend Developer'
-- UNION ALL
-- SELECT 'BITS Pilani' AS node, student_name, branch, primary_role FROM college_COL003_db.students WHERE primary_role = 'Frontend Developer';

-- Query 3: Distributed Aggregation (Talent count by node)
-- SELECT 'IIT Bombay' AS node, COUNT(*) AS student_count FROM college_COL001_db.students
-- UNION ALL
-- SELECT 'IIT Delhi' AS node, COUNT(*) AS student_count FROM college_COL002_db.students
-- UNION ALL
-- SELECT 'BITS Pilani' AS node, COUNT(*) AS student_count FROM college_COL003_db.students;
