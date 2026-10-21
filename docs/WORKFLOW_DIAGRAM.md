# HackBridge System Workflow & Architecture Diagrams

This document illustrates the end-to-end execution flows and architectural interactions across HackBridge.

---

## 1. End-to-End Student Hackathon Journey

```mermaid
flowchart TD
  A["Student Registration / Login"] --> B["Profile Creation"]
  B --> C["Add Skills + Projects + Availability"]
  C --> D{"Choose Path"}
  
  D -->|"Has Team Idea"| E["Create Team Roster"]
  D -->|"Search Open Rosters"| F["Browse Teams & Apply"]
  D -->|"Solo Innovator"| G["Join 'I Don't Have A Team' Pool"]
  
  G --> H["Complementary Teammate Pairing"]
  H --> E
  
  E --> I["Team Completeness & Missing Role Analysis"]
  I --> J["Browse & Filter 180 Hackathons"]
  
  J --> K["Run Explainable Eligibility & Compatibility Engine"]
  K --> L{"Eligible & Match >= 70%?"}
  
  L -->|"Yes"| M["Ranked Recommendation (Recommended = 1)"]
  L -->|"No / Ineligible"| N["Display Diagnostic Skill Gaps & Deadlines"]
  
  M --> O["Find Tailored Industry Mentors"]
  O --> P["Request Mentorship (Capacity Enforced)"]
  P --> Q["Submit Official Hackathon Application"]
  Q --> R["Track Announcements & Milestones"]
```

---

## 2. Explainable Recommendation Engine Flow

```mermaid
flowchart LR
  subgraph Inputs["Engine Inputs"]
    T["Team Roster (Accepted Members)"]
    H["Hackathon Specification"]
  end

  subgraph Weights["Weighted Compatibility Model"]
    S["Skill Match: 45%<br/>Strongest Member Proficiency"]
    E["Experience Match: 20%<br/>Team Exp / Event Threshold"]
    D["Domain Match: 20%<br/>Prior Domain Projects Fraction"]
    C["Team Completeness: 15%<br/>Roster Size / Event Bounds"]
  end

  subgraph Output["Decision Engine"]
    Score["Overall Score = 0.45*S + 0.20*E + 0.20*D + 0.15*C"]
    Elg{"Eligibility Check<br/>1. Deadline >= Today<br/>2. Min <= Size <= Max"}
    Rec["Recommended Status (Score >= 70)"]
    Expl["Plain-Language Diagnostic Breakdown"]
  end

  T --> S & E & D & C
  H --> S & E & D & C
  S & E & D & C --> Score
  Score --> Elg
  Elg --> Rec & Expl
```

---

## 3. DDBMS Distributed Query Decomposition

```mermaid
sequenceDiagram
  autonumber
  actor User as Evaluator / Student
  participant UI as Frontend DDBMS Explorer
  participant Service as DDBMS Service (Backend)
  participant NodeA as Node A: college_C001_db (Pune)
  participant NodeB as Node B: college_C002_db (Mumbai)
  participant NodeC as Node C: college_C003_db (Nagpur)

  User->>UI: Select "Distributed UNION Query (Python Talent)"
  UI->>Service: POST /api/ddbms/query { query_type: "union", skill: "Python" }
  Note over Service: Location Transparency Layer parses query<br/>Decomposes into 3 subqueries for fragments
  par Query Node A
    Service->>NodeA: SELECT student_name FROM college_C001_db WHERE skill = 'Python'
    NodeA-->>Service: Return Local Fragment A Rows
  and Query Node B
    Service->>NodeB: SELECT student_name FROM college_C002_db WHERE skill = 'Python'
    NodeB-->>Service: Return Local Fragment B Rows
  and Query Node C
    Service->>NodeC: SELECT student_name FROM college_C003_db WHERE skill = 'Python'
    NodeC-->>Service: Return Local Fragment C Rows
  end
  Note over Service: Assemble, format execution plan, and calculate latency
  Service-->>UI: Return 200 OK { total_rows, execution_time_ms, sql_execution_plan, results }
  UI-->>User: Render Interactive Result Table & SQL Plan
```
