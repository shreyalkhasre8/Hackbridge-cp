-- =====================================================================
-- HACKBRIDGE — DISTRIBUTED DATABASE SETUP AND QUERIES
-- Run this in MySQL Command Line / phpMyAdmin (each DB simulates a college node)
-- =====================================================================


-- =====================================================================
-- STEP 1: CREATE THE THREE DISTRIBUTED DATABASES (ONE PER COLLEGE)
-- =====================================================================
-- Each college is treated as an independent node in the distributed system.

CREATE DATABASE college_A_db;
CREATE DATABASE college_B_db;
CREATE DATABASE college_C_db;


-- =====================================================================
-- STEP 2: CREATE TABLES INSIDE COLLEGE A
-- =====================================================================
USE college_A_db;

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    college VARCHAR(100),
    skill VARCHAR(100),
    looking_for_team BOOLEAN
);

CREATE TABLE skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100)
);

CREATE TABLE studentskill (
    student_id INT,
    skill_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

CREATE TABLE team (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(100)
);

CREATE TABLE teammember (
    student_id INT,
    team_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE hackathon (
    hackathon_id INT PRIMARY KEY AUTO_INCREMENT,
    hackathon_name VARCHAR(150),
    date DATE,
    location VARCHAR(150)
);


-- =====================================================================
-- STEP 3: REPEAT THE SAME STRUCTURE FOR COLLEGE B
-- =====================================================================
USE college_B_db;

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    college VARCHAR(100),
    skill VARCHAR(100),
    looking_for_team BOOLEAN
);

CREATE TABLE skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100)
);

CREATE TABLE studentskill (
    student_id INT,
    skill_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

CREATE TABLE team (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(100)
);

CREATE TABLE teammember (
    student_id INT,
    team_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE hackathon (
    hackathon_id INT PRIMARY KEY AUTO_INCREMENT,
    hackathon_name VARCHAR(150),
    date DATE,
    location VARCHAR(150)
);


-- =====================================================================
-- STEP 4: REPEAT THE SAME STRUCTURE FOR COLLEGE C
-- =====================================================================
USE college_C_db;

CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    college VARCHAR(100),
    skill VARCHAR(100),
    looking_for_team BOOLEAN
);

CREATE TABLE skills (
    skill_id INT PRIMARY KEY AUTO_INCREMENT,
    skill_name VARCHAR(100)
);

CREATE TABLE studentskill (
    student_id INT,
    skill_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
);

CREATE TABLE team (
    team_id INT PRIMARY KEY AUTO_INCREMENT,
    team_name VARCHAR(100)
);

CREATE TABLE teammember (
    student_id INT,
    team_id INT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id)
);

CREATE TABLE hackathon (
    hackathon_id INT PRIMARY KEY AUTO_INCREMENT,
    hackathon_name VARCHAR(150),
    date DATE,
    location VARCHAR(150)
);


-- =====================================================================
-- STEP 5: INSERT SAMPLE DATA — COLLEGE A
-- =====================================================================
USE college_A_db;

INSERT INTO students (name, college, skill, looking_for_team) VALUES
('Rahul Sharma', 'College A', 'Python', TRUE),
('Aman Verma', 'College A', 'React', TRUE),
('Kiran Rao', 'College A', 'Java', FALSE);

INSERT INTO skills (skill_name) VALUES
('Python'), ('Machine Learning'), ('React'), ('UI/UX'), ('Java');

INSERT INTO studentskill (student_id, skill_id) VALUES
(1, 1), (1, 2), (2, 3), (3, 5);

INSERT INTO team (team_name) VALUES ('CodeCrafters');

INSERT INTO teammember (student_id, team_id) VALUES (1, 1);

INSERT INTO hackathon (hackathon_name, date, location) VALUES
('InnovateA 2026', '2026-09-15', 'College A Campus');


-- =====================================================================
-- STEP 6: INSERT SAMPLE DATA — COLLEGE B
-- =====================================================================
USE college_B_db;

INSERT INTO students (name, college, skill, looking_for_team) VALUES
('Priya Nair', 'College B', 'Python', TRUE),
('Sneha Iyer', 'College B', 'UI/UX', TRUE),
('Rohit Das', 'College B', 'Machine Learning', TRUE);

INSERT INTO skills (skill_name) VALUES
('Python'), ('Machine Learning'), ('React'), ('UI/UX'), ('Java');

INSERT INTO studentskill (student_id, skill_id) VALUES
(1, 1), (2, 4), (3, 2);

INSERT INTO team (team_name) VALUES ('ByteBenders');

INSERT INTO teammember (student_id, team_id) VALUES (3, 1);

INSERT INTO hackathon (hackathon_name, date, location) VALUES
('HackFest B 2026', '2026-10-02', 'College B Campus');


-- =====================================================================
-- STEP 7: INSERT SAMPLE DATA — COLLEGE C
-- =====================================================================
USE college_C_db;

INSERT INTO students (name, college, skill, looking_for_team) VALUES
('Aman Gupta', 'College C', 'React', TRUE),
('Sneha Kapoor', 'College C', 'UI/UX', TRUE),
('Vikram Singh', 'College C', 'Python', TRUE);

INSERT INTO skills (skill_name) VALUES
('Python'), ('Machine Learning'), ('React'), ('UI/UX'), ('Java');

INSERT INTO studentskill (student_id, skill_id) VALUES
(1, 3), (2, 4), (3, 1);

INSERT INTO team (team_name) VALUES ('LogicLords');

INSERT INTO teammember (student_id, team_id) VALUES (2, 1);

INSERT INTO hackathon (hackathon_name, date, location) VALUES
('CodeStorm C 2026', '2026-09-28', 'College C Campus');


-- =====================================================================
-- STEP 8: DISTRIBUTED QUERIES
-- =====================================================================

-- ---------------------------------------------------------------------
-- 8.1 LOCAL (FRAGMENT-LEVEL) QUERY
-- Purpose: Query a single node directly. No distribution involved yet —
-- this is just to show what a normal, non-distributed query looks like
-- before we combine nodes.
-- ---------------------------------------------------------------------
SELECT name, skill
FROM college_A_db.students
WHERE skill = 'Python';


-- ---------------------------------------------------------------------
-- 8.2 DISTRIBUTED QUERY USING UNION
-- Purpose: Search for a skill across ALL THREE colleges at once and
-- merge the results into one combined answer. This is the core
-- demonstration of horizontal fragmentation + distributed querying.
-- ---------------------------------------------------------------------
SELECT name, college, skill
FROM college_A_db.students WHERE skill = 'Python'
UNION
SELECT name, college, skill
FROM college_B_db.students WHERE skill = 'Python'
UNION
SELECT name, college, skill
FROM college_C_db.students WHERE skill = 'Python';


-- ---------------------------------------------------------------------
-- 8.3 DISTRIBUTED QUERY WITH MULTIPLE CONDITIONS
-- Purpose: Find students across all colleges who know Python OR Machine
-- Learning AND are currently looking for a team. Shows filtering logic
-- applied uniformly across distributed nodes.
-- ---------------------------------------------------------------------
SELECT name, college, skill, looking_for_team
FROM college_A_db.students
WHERE skill IN ('Python','Machine Learning') AND looking_for_team = 1
UNION
SELECT name, college, skill, looking_for_team
FROM college_B_db.students
WHERE skill IN ('Python','Machine Learning') AND looking_for_team = 1
UNION
SELECT name, college, skill, looking_for_team
FROM college_C_db.students
WHERE skill IN ('Python','Machine Learning') AND looking_for_team = 1;


-- ---------------------------------------------------------------------
-- 8.4 DISTRIBUTED AGGREGATE QUERY
-- Purpose: Count total students per college and view them side by side.
-- Demonstrates aggregation performed independently at each node, with
-- results assembled into one report.
-- ---------------------------------------------------------------------
SELECT 'College A' AS college, COUNT(*) AS total_students FROM college_A_db.students
UNION
SELECT 'College B', COUNT(*) FROM college_B_db.students
UNION
SELECT 'College C', COUNT(*) FROM college_C_db.students;


-- ---------------------------------------------------------------------
-- 8.5 DISTRIBUTED JOIN
-- Purpose: Join student + skill + team tables (which live together on
-- one node) to find, e.g., all Python-skilled students who are already
-- on a team. The same join runs separately on each node, then results
-- are combined — this is what makes it a "distributed" join.
-- ---------------------------------------------------------------------
SELECT s.name, sk.skill_name, t.team_name
FROM college_A_db.students s
JOIN college_A_db.studentskill ss ON s.student_id = ss.student_id
JOIN college_A_db.skills sk ON ss.skill_id = sk.skill_id
JOIN college_A_db.teammember tm ON s.student_id = tm.student_id
JOIN college_A_db.team t ON tm.team_id = t.team_id
WHERE sk.skill_name = 'Python'

UNION

SELECT s.name, sk.skill_name, t.team_name
FROM college_B_db.students s
JOIN college_B_db.studentskill ss ON s.student_id = ss.student_id
JOIN college_B_db.skills sk ON ss.skill_id = sk.skill_id
JOIN college_B_db.teammember tm ON s.student_id = tm.student_id
JOIN college_B_db.team t ON tm.team_id = t.team_id
WHERE sk.skill_name = 'Python'

UNION

SELECT s.name, sk.skill_name, t.team_name
FROM college_C_db.students s
JOIN college_C_db.studentskill ss ON s.student_id = ss.student_id
JOIN college_C_db.skills sk ON ss.skill_id = sk.skill_id
JOIN college_C_db.teammember tm ON s.student_id = tm.student_id
JOIN college_C_db.team t ON tm.team_id = t.team_id
WHERE sk.skill_name = 'Python';


-- ---------------------------------------------------------------------
-- 8.6 CROSS-NODE HACKATHON SEARCH
-- Purpose: Let a student see upcoming hackathons at ANY of the three
-- colleges in one unified, date-sorted list.
-- ---------------------------------------------------------------------
SELECT hackathon_name, date, location FROM college_A_db.hackathon
UNION
SELECT hackathon_name, date, location FROM college_B_db.hackathon
UNION
SELECT hackathon_name, date, location FROM college_C_db.hackathon
ORDER BY date;


-- ---------------------------------------------------------------------
-- 8.7 REPLICATION CONSISTENCY CHECK
-- Purpose: The "skills" master list is meant to be identical (replicated)
-- on every node. This query counts how many times each skill name
-- appears across all three databases combined — if replication is
-- correct, every skill should appear exactly 3 times (once per college).
-- ---------------------------------------------------------------------
SELECT skill_name, COUNT(*) AS occurrences
FROM (
    SELECT skill_name FROM college_A_db.skills
    UNION ALL
    SELECT skill_name FROM college_B_db.skills
    UNION ALL
    SELECT skill_name FROM college_C_db.skills
) AS all_skills
GROUP BY skill_name;


-- ---------------------------------------------------------------------
-- 8.8 TEAM-MATCHING SCORE QUERY (INNOVATION LAYER)
-- Purpose: Instead of a plain keyword search, calculate a simple
-- compatibility score for each student based on which required skills
-- they have. This is the SQL-only version of "smart" team matching
-- described in Stage 7 of the project (no real AI needed).
-- ---------------------------------------------------------------------
SELECT s.name, s.college,
    (CASE WHEN sk.skill_name = 'Python' THEN 30 ELSE 0 END +
     CASE WHEN sk.skill_name = 'Machine Learning' THEN 30 ELSE 0 END +
     CASE WHEN sk.skill_name = 'React' THEN 20 ELSE 0 END +
     CASE WHEN sk.skill_name = 'UI/UX' THEN 20 ELSE 0 END) AS match_score
FROM college_A_db.students s
JOIN college_A_db.studentskill ss ON s.student_id = ss.student_id
JOIN college_A_db.skills sk ON ss.skill_id = sk.skill_id
ORDER BY match_score DESC;

-- =====================================================================
-- END OF SCRIPT
-- =====================================================================
