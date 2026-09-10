# Career Fair Eligibility Shortlist

A client-side application that evaluates an editable student profile against five fixed career-fair role requirements, reports every applicable failure reason, and displays results as a sorted list or an optional card grid.

## Tech Stack

- **Build tool:** Vite
- **UI:** React
- **Language:** TypeScript
- **Styling:** Plain CSS
- **State:** React `useState`
- **Testing:** Vitest + React Testing Library

No backend, database, API, or authentication is used — the five roles are fixed local data, and all logic runs client-side.

## Getting Started

npm install
npm run dev

Open the local address shown in the terminal (typically http://localhost:5173).

## Running Tests

npm test

or for a single run without watch mode:

npx vitest run

## Building for Production

npm run build

## How It Works

1. Edit the student profile (branch, CGPA, graduation year, active backlogs, skills) or click **Sample** to load the built-in profile.
2. Click **Evaluate**.
3. The app validates the profile first — if invalid, it shows the specific validation errors and clears any prior results.
4. If valid, it evaluates the profile against all five roles independently, reporting every applicable failure reason per role (not just the first one).
5. Results are sorted: eligible roles first, then ineligible, each group alphabetically by role title, with role ID as a tie-breaker.
6. Toggle between **List View** and **Card View** to see the same results in a different layout — both are driven by the same underlying evaluation data, so they can never disagree.
7. Click **Reset** to restore the built-in profile and clear all results.

## Built-in Sample Profile

| Field | Value |
|---|---|
| Branch | CSE |
| CGPA | 8.1 |
| Graduation Year | 2027 |
| Active Backlogs | 1 |
| Skills | Git, Python, SQL |

## Fixed Roles

| ID | Title |
|---|---|
| CF01 | Data Operations Intern |
| CF02 | QA Automation Intern |
| CF03 | Embedded Systems Intern |
| CF04 | Machine Learning Intern |
| CF05 | Platform Engineering Intern |

Full requirements per role are shown in the app's Role Requirements table.

## Project Structure

    src/
    ├── components/    # Presentational React components — no business logic
    ├── data/          # Fixed role and default-student data
    ├── domain/        # Pure, unit-tested business logic
    │   ├── normalize.ts     # Branch/skill normalization
    │   ├── validation.ts    # Profile validation rules
    │   ├── eligibility.ts   # Role-by-role eligibility engine (single source of truth)
    │   └── sorting.ts       # Result ordering
    ├── types/         # Shared TypeScript domain models
    ├── App.tsx        # Single source of state; orchestrates the domain layer
    ├── App.css        # Application styling
    └── index.css      # Global resets

    tests/
    ├── normalize.test.ts
    ├── validation.test.ts
    ├── eligibility.test.ts
    ├── sorting.test.ts
    └── app.test.tsx    # End-to-end integration tests via React Testing Library

## Architectural Principles

- **Single source of truth:** all eligibility logic lives in `domain/eligibility.ts`. The list view, card view, and summary counts all render the same `EvaluationResult[]` — they can never disagree.
- **No early returns in evaluation:** every rule (branch, CGPA, graduation year, backlogs, skills) is checked independently per role, so every applicable failure reason is reported, not just the first one encountered.
- **Deterministic, testable domain layer:** normalization, validation, eligibility, and sorting are pure functions with no React dependency, each covered by focused unit tests.

## AI-Assisted Development

This project was built iteratively with AI assistance, following a Problem Statement → PRD → Technical Design Document → step-by-step implementation workflow. Each implementation step was committed separately using conventional commit messages (`feat:`, `test:`, `style:`, `docs:`, `chore:`, `refactor:`). See `AI_PROMPT_PLAN.md` for the full documented prompt history used during development.