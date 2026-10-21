# HackBridge — Intelligent Inter-College Hackathon Collaboration Platform

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21.x-000000?logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com)
[![Tests](https://img.shields.io/badge/Tests-17%2F17%20Passing-brightgreen)](tests/)

> **HackBridge** connects student innovators across higher education institutions, helps them form balanced, complementary teams, recommends tailored hackathons using an explainable 4-factor compatibility model, connects them with industry mentors, and demonstrates distributed database management system (DDBMS) architecture across simulated college nodes.

---

## 1. Project Overview & Visual Style

Designed with the distinctive, warm, organic visual aesthetic inspired by `hiddenhunt`:
- **Deep Olive & Forest Greens** (`#223222`, `#1A261A`) as the foundational brand colors.
- **Warm Cream & Ivory Surfaces** (`#F8F5EE`, `#FFFFFF`) replacing generic white dashboards.
- **Rich Mustard & Honey Accents** (`#D99511`, `#E5A82E`) for prominent calls to action.
- **Elegant Editorial Headings** (`Fraunces` display serif) paired with highly legible body typography (`Plus Jakarta Sans`).
- **Rounded Cards, Pill Tags & Organic Shadows** with accessible focus states.

---

## 2. Key Modules & Features

1. **Authentication & Role-Based Profiles (Person 1)**:
   - Full JWT registration and login with `bcryptjs` password hashing.
   - 4 discrete roles: `Student`, `Mentor`, `College/Organizer`, and `Admin`.
   - Dynamic Profile Completeness score (0–100%) explaining missing academic/skill evidence.
2. **Team Management & Smart Formation (Person 2)**:
   - Create, search, and join teams with leader approval workflows.
   - **"I Don't Have A Team" Feature**: Students enter a matching pool; the algorithm pairs complementary roles and skills rather than grouping identical engineers.
   - Team Completeness score and missing-role detection (e.g., automatically flags when a team lacks a UI/UX designer or Backend architect).
3. **Hackathon Discovery & Explainable Recommendations (Person 3)**:
   - Curated 180-event database with filters for Mode (Online/Offline/Hybrid), Domain, Difficulty, and Prize Pool.
   - **4-Part Weighted Recommendation Formula**:
     $$\text{Overall Compatibility} = 0.45 \times \text{Skill Match} + 0.20 \times \text{Experience Match} + 0.20 \times \text{Domain Match} + 0.15 \times \text{Team Completeness}$$
   - Independent Eligibility Evaluation: Plain-English rejection reasons if registration deadlines have passed or team size limits are violated.
4. **Mentor Management & Matching (Person 4)**:
   - 100 industry mentor profiles with ratings, years of experience, and specialization.
   - **Documented Mentor Match Formula**: $65\% \text{ Skill Proficiency} + 25\% \text{ Domain Fit} + 10\% \text{ Normalized Rating}$.
   - Backend capacity enforcement preventing mentors from being allocated more than `max_teams`.
5. **DDBMS Architecture Simulation (Academic Requirement 13)**:
   - Master schema (`hackbridge_db`) with horizontal fragmentation across 3 autonomous simulated college schemas:
     - Node A: `college_C001_db` (Sahyadri Institute of Engineering, Pune)
     - Node B: `college_C002_db` (Sahyadri Institute of Engineering, Mumbai)
     - Node C: `college_C003_db` (Sahyadri Institute of Engineering, Nagpur)
   - Replicated reference tables (`skills`, `hackathons`).
   - Interactive Query Console executing Local Fragment, Distributed UNION, Multi-Condition, Distributed Aggregate, and Distributed JOIN queries.
6. **Analytics & Administration**:
   - Recharts visual dashboards for college participation vs wins, domain distribution, and skill demand vs student supply.
   - Admin console with 1-click role modification and system health overview.

---

## 3. Technology Stack

- **Frontend**: React 19, Vite 8, React Router v7, Recharts, Lucide React, Plain CSS Tokens.
- **Backend**: Node.js v24, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`.
- **Database Layer**:
  - Primary: MySQL 8 with `mysql2/promise` connection pooling.
  - Fail-safe Dataset Fallback: In-memory relational store indexed from canonical CSV datasets, ensuring 100% features work immediately out-of-the-box even before MySQL credentials are configured.
- **Testing**: Built-in Node.js Test Runner (`node:test`) for unit and integration testing.

---

## 4. Repository Structure

```
Hackbridge-cp-main/
├── backend/                  # Express REST API Server
│   ├── src/
│   │   ├── config/           # DB pool & environment loaders
│   │   ├── middleware/       # JWT auth & centralized error handler
│   │   ├── repositories/     # In-memory relational indexer & operational store
│   │   ├── routes/           # Modular REST routes (auth, students, teams, etc.)
│   │   ├── services/         # Algorithmic engines (compatibility, mentors, DDBMS)
│   │   ├── app.js            # Express app configuration & static server
│   │   └── server.js         # HTTP server entry point
│   ├── .env.example
│   └── package.json
├── frontend/                 # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/       # AppLayout, Navbar, Footer, CompatibilityBadge, Modal, Toast
│   │   ├── context/          # AuthContext with 1-click demo persona switcher
│   │   ├── pages/            # 16 complete functional pages
│   │   ├── services/         # API fetch client
│   │   └── styles/           # theme.css & global.css (olive/ivory design tokens)
│   ├── package.json
│   └── vite.config.js
├── database/                 # Relational Schemas & SQL Scripts
│   ├── schema.sql            # Master MySQL 8 schema with all foreign keys & indexes
│   ├── ddbms_simulation.sql  # 3-node simulated horizontal fragmentation & replication
│   └── hackbridge_full_reference.sql
├── data/
│   └── raw/                  # 14 Canonical CSV files & data dictionary
├── docs/                     # Architectural Documentation
│   ├── TEAM_WORK_DIVISION.md # 4-member responsibility breakdown from PDF
│   ├── DDBMS_ARCHITECTURE.md # Distributed database specification
│   ├── API_DOCUMENTATION.md  # Complete REST API reference
│   ├── WORKFLOW_DIAGRAM.md   # Mermaid sequence & flowchart diagrams
│   └── DATA_DICTIONARY.md    # Relational dictionary & counts
├── scripts/                  # Automation & Validation Tools
│   ├── validate-dataset.js   # Zero-dependency dataset & formula validator
│   └── import-dataset.js     # MySQL bulk CSV importer
├── tests/                    # Automated Test Suite
│   ├── engine.test.js        # Core formula & DDBMS unit tests
│   └── api.test.js           # REST API integration tests
├── .env.example              # Template environment configuration
├── .gitignore
├── package.json              # Root orchestration scripts
└── README.md
```

---

## 5. Verified Dataset Statistics

Validated via `npm run validate` against `data/raw/`:

| Dataset Entity | Canonical File | Verified Row Count |
|---|---|---|
| Higher Education Colleges | `colleges.csv` | **60 rows** |
| Technical Skills Catalog | `skills.csv` | **82 rows** |
| Student Innovators | `students.csv` | **1,200 rows** |
| Student-Skill Relationships | `student_skills.csv` | **7,699 rows** |
| Hackathon Opportunities | `hackathons.csv` | **180 rows** |
| Hackathon Required Skills | `hackathon_required_skills.csv` | **1,214 rows** |
| Formed Teams | `teams.csv` | **720 rows** |
| Team Member Rosters | `team_members.csv` | **2,923 rows** |
| Industry Mentors | `mentors.csv` | **100 rows** |
| Mentor Skill Competencies | `mentor_skills.csv` | **784 rows** |
| Team-Mentor Mappings | `team_mentor_mapping.csv` | **120 rows** |
| Student Portfolio Projects | `projects.csv` | **3,634 rows** |
| Hackathon Participations | `hackathon_participation.csv` | **2,384 rows** |
| Team-Hackathon Compatibility | `team_hackathon_compatibility.csv` | **14,400 rows** |

---

## 6. Instant Evaluator Demo Accounts

HackBridge includes pre-seeded demo accounts and a **1-Click Persona Switcher** in the top navigation bar.

| Role | Demo Email | Password | Persona Context |
|---|---|---|---|
| **Student** | `student@hackbridge.edu` | `Demo@123` | Aarav Patel (IIT Bombay, AI/ML, leads "NeuralCraft") |
| **Mentor** | `mentor@hackbridge.edu` | `Demo@123` | Dr. Vikram Malhotra (Cloud & Distributed Systems, 4.9★) |
| **College / Organizer** | `organizer@hackbridge.edu` | `Demo@123` | IIT Bombay Innovation Cell (Host & Announcement Admin) |
| **Admin** | `admin@hackbridge.edu` | `Demo@123` | Platform Superuser (Cluster & Role Governance) |

---

## 7. Installation & Quick Start

### Prerequisites
- Node.js v18+ (tested on Node.js v24.22.0)
- npm v9+

### 1. Configure Environment
Copy `.env.example` to `backend/.env`:
```powershell
Copy-Item .env.example backend/.env
```
*(If MySQL is not installed or configured, HackBridge automatically operates using the loaded dataset store with zero configuration needed).*

### 2. Run the Full-Stack Application
You can run the entire platform with one command:
```powershell
npm start
```
This boots the REST backend, connects to the database layer, and serves the pre-built frontend UI directly at:
👉 **`http://localhost:5000`**

### Alternatively: Run with Frontend Hot Reloading (Vite)
Open two terminal windows:
- **Terminal 1 (Backend)**:
  ```powershell
  npm run server
  ```
- **Terminal 2 (Frontend Dev Server)**:
  ```powershell
  npm run client
  ```
  Visit: `http://localhost:5173`

---

## 8. Database Setup & Bulk CSV Import (MySQL 8)

When you wish to import data directly into your local MySQL server:

1. Create the database schema:
   ```powershell
   mysql -u root -p < database/schema.sql
   ```
2. Set your MySQL credentials in `backend/.env`:
   ```ini
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=hackbridge_db
   ```
3. Run the automated bulk importer:
   ```powershell
   npm run db:import
   ```
4. Set up the 3-node simulated DDBMS fragment databases:
   ```powershell
   mysql -u root -p < database/ddbms_simulation.sql
   ```

---

## 9. Automated Testing & Verification

Run all test suites with:
```powershell
npm test
```

### Test Results Breakdown
- `scripts/validate-dataset.js`:
  - 14 CSV files checked against expected counts: **14/14 PASS**
  - Foreign key referential integrity: **6/6 PASS (0 unmatched)**
  - Weighted compatibility formula verification: **100/100 sample rows PASS**
- `tests/engine.test.js`:
  - DataStore dataset loading: **PASS**
  - Hackathon Compatibility 4-factor formula: **PASS**
  - Registration deadline & roster size eligibility check: **PASS**
  - Mentor 65/25/10 matching engine: **PASS**
  - Team completeness & missing-role detection: **PASS**
  - DDBMS distributed query execution: **PASS**
- `tests/api.test.js`:
  - `/api/health`, `/api/auth/demo-login`, `/api/students`, `/api/teams`, `/api/hackathons`, `/api/mentors`, `/api/analytics/overview`, `/api/ddbms/cluster`: **10/10 PASS**

---

## 10. License & Academic Attribution
Developed as an academic demonstration of Distributed Database Management Systems (DDBMS), explainable recommendation engines, and modern collaborative web architecture. All student and institutional records are synthetic.
