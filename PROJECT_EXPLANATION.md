# 🏋️ A-PlanSport (APS) — Scientific Weight Training Prescription & Periodization Engine
> **System Architecture & Technical Specification Documentation**
> *Designed for AI Understanding, Codebase Context Sharing, & Developer Reference.*

---

## 🎯 1. Overview & Vision
**A-PlanSport (APS)** is an evidence-based, scientific exercise physiology prescription & periodization engine. It automates the complex job of a Sports Scientist / Strength & Conditioning (S&C) Coach by transforming athlete health parameters, gym equipment availability, baseline 1RM loads, and performance goals into a fully personalized 4 to 12-week weight training program.

The application enforces strict **ACSM (American College of Sports Medicine)** and **NSCA (National Strength and Conditioning Association)** guidelines to ensure maximum adaptation (hypertrophy, max strength, power, muscular endurance) while protecting athletes from injury and overtraining.

---

## 🔬 2. Core Scientific Rule Engine Architecture

The core intelligence resides in `apps/web/src/core/engine/` (client-side rule engine) and `apps/api/src/engine/` (server-side rule engine).

### 2.1. Medical Safety Triage & Hard Stop System (`medical-triage.js`)
Evaluates 5 PAR-Q+ health screening questions:
- **HARD STOP Trigger**: Cardiac history, unexplained chest pain, or severe dizziness blocks program generation immediately (`HARD_STOP` status) and directs the athlete to a medical doctor.
- **Asthma / Respiratory Modification**: Increases rest intervals by **1.5x** to prevent bronchospasm.
- **Active Joint Injury Capping**: 
  - Upper Body Injury: Caps upper-body intensity at max 65% 1RM and blocks Category 1 high-risk heavy compound lifts.
  - Lower Body Injury: Caps lower-body intensity at max 65% 1RM.
  - Core Injury: Caps core intensity at 65% 1RM and restricts heavy axial loading.
- **Medication Warning**: Mandates RPE (Rate of Perceived Exertion) autoregulation mode instead of rigid %1RM loading.

### 2.2. Age & Physiological Safety Modifiers (`training-age-modifier.js`)
- **Pediatric (<14 years old)**: Restricts 100% 1RM max testing to protect epiphyseal growth plates. Caps intensity at RPE 7-8 and limits sets to 1-2 per exercise.
- **Geriatric (>65 years old)**: Blocks explosive Power phases (high injury risk), extends rest intervals by 1.5x, and reduces volume per session.

### 2.3. Minimum Viable Workout (MVW) & Equipment Substitution (`equipment-substitution.js`)
- Checks selected gym equipment against 7 primary movement patterns:
  1. Horizontal Push (e.g. Bench Press)
  2. Horizontal Pull (e.g. Seated Row)
  3. Vertical Pull (e.g. Lat Pulldown)
  4. Vertical Push (e.g. Overhead Press)
  5. Knee-Dominant (e.g. Squat / Leg Extension)
  6. Hip-Dominant (e.g. Deadlift / Hamstring Curl)
  7. Core / Trunk Stability
- Automatically flags system warnings if a movement pattern is missing in the athlete's gym and suggests exact equipment additions.

### 2.4. Periodization Strategy & Block Structuring (`periodization.js`)
Supports two main periodization models:
1. **Block Periodization (Sequential Model)**:
   - *Block 1 (Weeks 1-4)*: Hypertrophy / Muscle Accumulation (8-12 reps, 65-75% 1RM).
   - *Block 2 (Weeks 5-8)*: Max Strength / Intensification (3-6 reps, 80-90% 1RM).
2. **Daily Undulating Periodization (DUP / Concurrent Model)**:
   - Rotates Hypertrophy, Strength, and Power stimuli across daily sessions within the same week.

### 2.5. Volume Ceilings & Overload/Deload Modulation (`session-builder.js` & `overload-deload.js`)
- **MRV (Maximum Recoverable Volume) Daily Ceilings**:
  - Beginner (`BEGINNER`): Max **14 total sets per session**.
  - Intermediate (`INTERMEDIATE`): Max **18 total sets per session**.
  - Advanced (`ADVANCED`): Max **22 total sets per session**.
- **Deload Recovery Microcycles**:
  - Every 4th week (Week 4 & Week 8) is automatically configured as a **Deload Recovery Phase**.
  - Volume (total sets) is reduced by **40% - 50%**, and intensity is capped at 60-65% 1RM to allow Central Nervous System (CNS) & connective tissue recovery.

---

## 🎨 3. Application Workflow (5-Step Wizard)

1. **Step 1: Profile & Medical Screening (`ProfileStep.jsx` / `ScreeningStep.jsx`)**
   - Collects athlete name, age, gender, sport discipline, experience level, and 5-question PAR-Q+ screening.
2. **Step 2: Equipment Inventory (`EquipmentStep.jsx`)**
   - Multi-select interactive grid of 43+ validated gym equipment and movement patterns.
3. **Step 3: Baseline 1RM Database (`OneRMStep.jsx`)**
   - Inputs known 1RM loads (kg) or uses built-in 1RM Epley/Brzycki Calculator modal for estimated 1RM. Features 3-row responsive card grid and Category Filter Pills (*All, Upper Push, Upper Pull, Lower Body, Core*).
4. **Step 4: Program Parameters (`GoalsStep.jsx`)**
   - Selects program duration (4, 6, 8, 10, 12 weeks), days per week (2, 3, 4, 5, 6 days), goals (*Hypertrophy, Strength, Power, Endurance*), and target 1RM increase percentage (+1% to +30%).
5. **Step 5: Program Results & Scientific Diagnostics (`ProgramResult.jsx`)**
   - Displays 2-tier full-width action header (*Edit, Save, PDF, Excel, New Program*), 3 stat summary cards, 4-domain physiological evaluation diagnostic cards, volume bar chart, equipment baseline table, and detailed weekly/daily session prescription tables.

---

## 🛠️ 4. Tech Stack & Repository Structure

Monorepo workspace layout:
```
precisetrain-monorepo/
├── PROJECT_EXPLANATION.md          # Master System Architecture (This File)
├── package.json                    # Workspace scripts (npm run dev, npm run build)
├── apps/
│   ├── web/                        # React 18 + Vite 5 + Tailwind CSS v4 Frontend
│   │   ├── index.html              # App Entry (Title: A-PlanSport)
│   │   └── src/
│   │       ├── components/
│   │       │   ├── layout/         # TopNavBar, SideNavBar, BottomNavBar, Footer (Badge: APS)
│   │       │   ├── wizard/         # 5 Wizard Step Components + WizardContainer
│   │       │   ├── program/        # ProgramResult.jsx (Dashboard & Sessions)
│   │       │   └── pages/          # GuidePage, CalculatorPage, AnalyticsPage, etc.
│   │       ├── core/
│   │       │   ├── db/             # master-data.js, user-store.js (localStorage/Supabase), compatibility-matrix.js
│   │       │   ├── engine/         # Rule engine modules (rule-engine, session-builder, medical-triage, etc.)
│   │       │   └── utils/          # pdf-generator.js (jsPDF Vector Report), excel-generator.js (ExcelJS), helpers.js
│   │       └── hooks/              # useProgramGenerator, useLanguage, useAuth
│   └── api/                        # Express + TypeScript + Drizzle ORM + Supabase PostgreSQL Backend
```

---

## 📊 5. Export Engines Specification

### 5.1. PDF Report Generator (`pdf-generator.js`)
- Uses `jsPDF` and `jspdf-autotable`.
- **Layout**: Crisp 12mm page margins, 3-color brand header bar (*Crimson `#E63946`, Orange `#F3722C`, Amber `#F9A826`*).
- **Running Headers & Footers**: Header title on page 2+, page numbering (`Page X of Y`).
- **Vector Volume Bar Chart**: Custom PDF vector bar chart rendering weekly volume progression with node dots and overload/deload legend.
- **Smart Page Break Protection**: `ensureSpace()` helper prevents orphaned section headers.

### 5.2. Excel Workbook Generator (`excel-generator.js`)
- Uses `ExcelJS`.
- Generates a multi-sheet workbook: *Program Summary*, *Weekly Workout Logs*, *Equipment & 1RM Database*, and *Physiological Diagnostics*.

---

## 🏆 6. Key Brand & Identity Standards
- **App Title**: `A-PlanSport`
- **Badge Abbreviation**: `APS`
- **Primary Color Accent**: Crimson Red (`#E63946`)
- **Secondary Accent**: Orange (`#F3722C`) & Golden Amber (`#F9A826`)
- **Dark Mode Surface**: Slate-900 (`#0F172A`)
