# WellNest AI — Frontend

AI-powered healthcare companion. Frontend built with **Vite + React + Tailwind CSS**, based on the WellNest AI PRD (Hackathon MVP).

## Getting started

Requires the [wellnest-ai-backend](../wellnest-ai-backend) API running (defaults to
`http://localhost:4100/api` — override with `VITE_API_BASE_URL` in `.env`; see `.env.example`).

```bash
npm install
cp .env.example .env
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). You'll land on the sign-in screen —
use the backend's seeded demo account (`sarah@wellnest.ai` / `WellNest123!`) or create a new one.

To build for production:

```bash
npm run build
npm run preview   # serve the production build locally
```

## Stack

- **Vite** — build tool / dev server
- **React 19** — UI
- **React Router** — client-side routing
- **Tailwind CSS** — styling, with a custom design system (see `tailwind.config.js`)
- **lucide-react** — icons

## Project structure

```
src/
  assets/         Logo and static assets
  components/     Shared UI (Sidebar, Topbar, Layout, PageHeader, VitalRing, RequireAuth)
  context/        AuthContext — token/session state, login/register/logout
  lib/            api.js — fetch wrapper + per-domain API calls to the backend
  pages/          One file per screen (Login, Dashboard, Documents, Medications, AIChat,
                  Timeline, FamilyCare, Emergency, Settings)
  App.jsx         Route definitions (Login is public; everything else requires auth)
  main.jsx        App entry point
  index.css       Tailwind entry + global styles
```

## What's implemented

All P0 + P1 screens from the PRD, wired to the live backend API (`src/lib/api.js`) —
no more mock data:

- **Login / Create account** — sign in, or register as a patient or caregiver
- **Dashboard** — health status hero, weekly adherence, quick actions, recent activity, latest vitals
- **Documents** — scan/upload/browse, drag-and-drop, uploads run through the backend's mock OCR/NLP pipeline
- **Medications** — weekly adherence chart, time-of-day schedule, mark-as-taken, reminder toggles
- **Ask WellNest AI** — chat UI with quick-prompt chips and context-aware replies from the backend
- **Health Timeline** — chronological record of diagnoses, documents, medication changes, appointments
- **Family Care** — caregiver list, access levels, invite flow
- **Emergency Health Wallet** — blood group, allergies, conditions, medications, emergency contacts
- **Settings** — account info, notification preferences, sign out

Auth is a JWT stored in `localStorage`; `AuthContext` fetches the profile on load and `RequireAuth`
redirects to `/login` when there's no valid session (including on a 401 from any API call).

## Design system

- **Colors**: indigo `#2C49C0` (primary/brand, from the logo), meadow green `#2E9B4F`
  (adherence/positive states), coral `#D5473D` (emergency/alerts), plus warm neutrals.
- **Type**: Sora (headings), IBM Plex Sans (body/data), IBM Plex Mono (small data labels).
- Tokens live in `tailwind.config.js` — adjust colors/fonts there to re-theme the whole app.
