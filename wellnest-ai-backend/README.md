# WellNest AI Backend

NestJS + TypeScript + MySQL/TypeORM backend for the WellNest AI hackathon MVP (see `../WellNest_AI_PRD.docx`).

AI/OCR/NLP are **mocked** for this MVP (deterministic, keyword-based — see `src/modules/ai/`) so the full
patient flow works end-to-end without external API keys. Swap the services in `src/modules/ai/` for real
OCR/LLM calls when ready; their public method signatures are the integration seam.

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in DB_* and JWT_SECRET
pnpm run seed           # creates demo patient sarah@wellnest.ai / WellNest123!
pnpm run start:dev
```

API: `http://localhost:4100/api` · Swagger: `http://localhost:4100/api/docs`

## Modules

`auth` · `users` · `documents` (upload + mock OCR/NLP) · `medications` (schedule + adherence) · `chat`
(mock AI assistant) · `family` (caregiver invites/access) · `timeline` (health journey + recent activity) ·
`emergency` (emergency wallet) · `ai` (shared mock OCR/NLP/diagnosis-translator/assistant services).

## Frontend

`../wellnest-ai-frontend` is wired to this API (see its own README section below) — login/register,
all pages, and every action (document upload, medication toggles, chat, family invites, preferences)
call this backend directly. Not yet done: swapping the mock OCR/NLP/assistant services under
`src/modules/ai/` for real providers.
