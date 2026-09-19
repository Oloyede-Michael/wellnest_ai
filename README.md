# WellNest AI

**Understand. Track. Heal Together.**

WellNest AI is an AI-powered healthcare companion built for the WeTech AI Hackathon 2026 (Social Impact — Healthcare track). It helps patients and caregivers understand medical documents, manage medications, and track their health journey — all in plain, simple language.

Instead of a generic chatbot, WellNest is designed as a long-term companion: you upload a prescription, lab report, or discharge summary, and WellNest reads it, translates the medical jargon into everyday words, builds a medication schedule, and lets you ask follow-up questions about *your own* records.

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Full Stack)](#quick-start-full-stack)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Enabling the AI Features (NVIDIA NIM)](#enabling-the-ai-features-nvidia-nim)
- [Demo Account](#demo-account)
- [Database Setup (MySQL)](#database-setup-mysql)
- [API Reference](#api-reference)
- [Useful Scripts](#useful-scripts)
- [Troubleshooting](#troubleshooting)

---

## What It Does

| Feature | Description |
|---|---|
| **AI Document Analysis** | Upload or scan a prescription, lab result, or discharge summary (image or PDF). The document is analyzed, and the diagnosis, findings, and medications are extracted and explained in plain language. |
| **Medication Planner** | Automatically builds a Morning / Afternoon / Night schedule from your documents, with dosage instructions and a weekly adherence chart you can tick off. |
| **Ask WellNest AI** | A chat assistant that answers questions ("What does my diagnosis mean?", "What if I miss a dose?") grounded in the documents you've uploaded. |
| **Health Timeline** | A chronological record of diagnoses, documents, medication changes, and appointments. |
| **Family Care Mode** | Invite trusted caregivers and control what they can see (full access or appointments only). |
| **Emergency Health Wallet** | Blood group, allergies, conditions, current medications, and emergency contacts — quickly accessible in an emergency. |
| **Dashboard** | Health status, weekly medication adherence, recent activity, and latest vitals at a glance. |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Vite, React 19, React Router, Tailwind CSS, lucide-react, recharts, pdfjs-dist |
| **Backend** | NestJS 11 (TypeScript), TypeORM, JWT auth, Swagger, class-validator |
| **Database** | MySQL (see [Database Setup](#database-setup-mysql)) |
| **AI** | Mock OCR/NLP/assistant services in the backend (deterministic, keyword-based — no API keys needed), plus an NVIDIA NIM integration in the frontend that is not yet wired into the UI |

---

## Project Structure

```
.
├── wellnest-ai-frontend/     # Vite + React app (all user-facing screens)
│   └── src/utils/nimApi.js   # NVIDIA NIM AI pipeline (OCR + chat) — not yet wired into the UI
├── wellnest-ai-backend/      # NestJS API (auth, documents, medications, chat, ...)
│   └── src/modules/ai/       # Mock OCR / NLP / assistant services (the active AI today)
├── sample-documents/         # Sample prescription (PDF + PNG) to test document upload
├── scripts/
│   └── generate_test_doc.py  # Regenerates the sample documents (Pillow, Python)
└── wellnest_prd.txt          # Product requirements document
```

---

## Prerequisites

- **Node.js 20+** — [download here](https://nodejs.org)
- **npm** (comes with Node) — used by the frontend
- **A MySQL server** — the backend connects to MySQL. Local install or Docker both work:

  ```bash
  docker run --name wellnest-mysql -e MYSQL_ROOT_PASSWORD=yourpassword \
    -e MYSQL_DATABASE=wellnest_ai -p 3306:3306 -d mysql:8
  ```

- *(Optional)* **Python 3 + Pillow** — only if you want to regenerate the sample documents
- *(Optional)* **NVIDIA NIM API key(s)** — only if you want to wire up the real-AI frontend pipeline (the app currently runs without any API keys; see [Enabling the AI Features](#enabling-the-ai-features-nvidia-nim))

---

## Quick Start (Full Stack)

Want everything running in ~2 minutes? From the repo root:

```bash
# 1. Backend
cd wellnest-ai-backend
npm install
cp .env.example .env            # then edit DB_USERNAME / DB_PASSWORD / JWT_SECRET
npm run seed                    # creates the demo account + demo data
npm run start:dev               # API on http://localhost:4100/api

# 2. Frontend (new terminal)
cd wellnest-ai-frontend
npm install
cp .env.example .env
npm run dev                     # app on http://localhost:5173
```

Then open **http://localhost:5173**, sign in with the demo account (below), and upload
`sample-documents/WellNest_Medical_Prescription_Summary.pdf` on the Documents page to see the
analysis pipeline in action.

> The backend **must** be running before you use the frontend — every page (login, documents,
> medications, chat, family, emergency wallet) talks to it.
>
> **No AI API keys are needed.** Document analysis and the AI assistant currently run on the
> backend's built-in mock services, so the full demo works offline.

---

## Running the Backend

```bash
cd wellnest-ai-backend
npm install
cp .env.example .env
```

Edit `.env` and set your database credentials and a JWT secret:

```env
PORT=4100
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_NAME=wellnest_ai

JWT_SECRET=use-a-long-random-string
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

> **Note:** in development (`NODE_ENV=development`) TypeORM auto-creates the tables — you only
> need the database itself to exist. Create it with `CREATE DATABASE wellnest_ai;` or use the
> Docker command above, which sets it up automatically.

Create the demo data and start the dev server (auto-reloads on changes):

```bash
npm run seed
npm run start:dev
```

You should see:

```
WellNest AI backend running on port 4100
Swagger available at http://localhost:4100/api/docs
```

Other commands:

| Command | What it does |
|---|---|
| `npm run start:dev` | Dev server with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build |
| `npm run seed` | Insert the demo patient + data (skips if it already exists) |
| `npm run typecheck` | TypeScript check, no output files |
| `npm run lint` | ESLint |
| `npm test` | Jest tests |

The AI services in the backend (`src/modules/ai/`) are **deterministic mocks** — keyword-based OCR,
NLP, diagnosis translation, and assistant — so the whole patient flow works end-to-end with no
external API keys. They're deliberately shaped like real AI services: when you're ready for real
models, swap the implementations inside `src/modules/ai/` (the method signatures are the
integration seam).

---

## Running the Frontend

```bash
cd wellnest-ai-frontend
npm install
cp .env.example .env
npm run dev
```

Open the printed URL — usually **http://localhost:5173**. You'll land on the landing page, then
sign in with the demo account or register a new patient/caregiver account.

Frontend `.env` options:

```env
VITE_API_BASE_URL=http://localhost:4100/api   # backend API location
```

Production build:

```bash
npm run build
npm run preview    # serve the production build locally
```

Auth is a JWT kept in `localStorage`; visiting a protected page without a valid session
redirects to `/login`.

---

## Enabling the AI Features (NVIDIA NIM)

**Status: built but not yet wired into the UI.** The frontend contains a complete NVIDIA NIM
pipeline in `wellnest-ai-frontend/src/utils/nimApi.js` (vision OCR + plain-language extraction +
context-aware chat), but the `HealthProvider` that would use it is not mounted in `main.jsx` yet —
so the live app currently uses the backend's mock AI services instead.

If you want to finish this integration, here's what already exists:

- **Document OCR & extraction** — `extractDocumentWithOCR()` sends an image (as a data URL) or
  extracted PDF text to `meta/llama-3.2-11b-vision-instruct` and returns structured JSON:
  document type, title, diagnosis, findings with plain-language interpretations, a medication
  plan, and follow-up recommendations.
- **PDF handling** — `src/utils/pdfExtractor.js` reads PDFs client-side with `pdfjs-dist`.
- **Grounded AI chat** — `askWellNestAi()` answers questions using the patient's uploaded records.
- **Key management** — supports multiple keys (`nim1`–`nim5` in the frontend `.env`, keys look
  like `nvapi-...` from [build.nvidia.com](https://build.nvidia.com)) with automatic rotation on
  401/403/429/503 and a Vite dev-server proxy (`/api/nim →
  https://integrate.api.nvidia.com/v1`) to sidestep CORS.

To wire it up: mount `HealthProvider` (from `src/context/HealthContext.jsx`) in `main.jsx`, point
the relevant pages at `useHealth()` instead of (or alongside) `src/lib/api.js`, and add your key
as `nim1=nvapi-...` in `wellnest-ai-frontend/.env`.

---

## Demo Account

The seed script creates a fully populated demo patient (Sarah — hypertension care plan, 3
documents, medication schedule, adherence history, timeline events, caregivers, and emergency
wallet):

| | |
|---|---|
| **Email** | `sarah@wellnest.ai` |
| **Password** | `WellNest123!` |

Re-running `npm run seed` is safe — it skips if the demo user already exists. Delete the user row
to re-seed fresh.

---

## Database Setup (MySQL)

The backend is configured for MySQL out of the box. If you used the Docker command from
[Prerequisites](#prerequisites), you're already set — just fill in `DB_PASSWORD=yourpassword` in
the backend `.env`.

Using your own MySQL server instead? Make sure it's reachable and create the database:

```sql
CREATE DATABASE wellnest_ai;
```

Then start the backend — tables are created automatically in development. (For production, set
`NODE_ENV=production` so TypeORM stops auto-syncing the schema, and manage migrations instead.)

---

## API Reference

Once the backend is running, interactive Swagger docs are available at:

**http://localhost:4100/api/docs**

Main endpoint groups (all prefixed with `/api`, all except `auth` and `health` require a
`Bearer` token):

| Group | Purpose |
|---|---|
| `/api/auth` | Register, login (JWT) |
| `/api/users` | Profile, preferences, vitals |
| `/api/documents` | Upload + analyze medical documents |
| `/api/medications` | Schedule blocks, items, dose logging |
| `/api/chat` | AI assistant messages |
| `/api/family` | Caregiver links + access levels |
| `/api/timeline` | Health journey events |
| `/api/emergency` | Emergency wallet profile + contacts |
| `/api/health` | Liveness check |

---

## Useful Scripts

| Script | Purpose |
|---|---|
| `scripts/generate_test_doc.py` | Regenerates the sample prescription PDF/PNG in `sample-documents/` |

```bash
pip install Pillow
python scripts/generate_test_doc.py
```

---

## Troubleshooting

**`npm run seed` fails with a connection error**
The backend can't reach MySQL. Confirm the server is running and that `DB_HOST`, `DB_PORT`,
`DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` in `wellnest-ai-backend/.env` are correct. The
`wellnest_ai` database must exist before seeding.

**Documents upload but show generic/placeholder analysis**
That's the backend's mock AI — the upload flow works, but extraction is keyword-based rather than
a real model. Wire up the NVIDIA NIM pipeline in `src/utils/nimApi.js` (see [Enabling the AI
Features](#enabling-the-ai-features-nvidia-nim)) for real analysis.

**Frontend shows errors / empty pages**
Check that the backend is running on port 4100 and that `VITE_API_BASE_URL` in the frontend
`.env` matches it. After changing `.env`, restart the dev server.

**Port already in use**
Backend: change `PORT` in `wellnest-ai-backend/.env` (and `VITE_API_BASE_URL` in the frontend to
match). Frontend: Vite will suggest the next free port automatically — or run `npm run dev --
--port 5174`.

**Login loops back to the sign-in screen**
Your JWT is stale. Sign out from Settings (or clear `localStorage` for the site) and sign in
again. Also verify `JWT_SECRET` hasn't changed since the token was issued.
