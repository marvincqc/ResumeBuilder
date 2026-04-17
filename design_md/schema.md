# Data Model

## Supabase Table: `resumes`
- id (uuid)
- lang (text)
- name, phone, job_type, experience, skills, education
- created_at (timestamp)
- github_commit_sha (text)

## GitHub Repo
- Path: `/submissions/{id}.json`
- Action: Auto-commit on new row insert (via Supabase Edge Function or API Route)

## Project: ResumeBot Web (Next.js Revamp)

**Stack**: Next.js 14 (App Router), TS, Tailwind, Supabase, GitHub API.
**UI**: Chat-like interface (client-side state).
**Data**: Collect → Supabase + GitHub mirror.
**Status**: 🟡 Full Revamp (Discard old webhook code).

### ✅ Keep (Logic Only)
- State machine flow: `lang → name → phone → job → skills → review`.
- Translations: `en/ms/zh/ta/bn/hi` (see @bot.js).
- Data model: `{name, phone, job_type, experience, skills, education}`.

### 🗑️ Discard
- Meta/FB APIs, webhooks, signatures, `server.js`, `messenger.js`.
- Ngrok, PSID sessions.

### 🚫 Constraints (Strict)
- **Max 300 tokens/response** unless I ask "expand".
- **No explanations** of Next.js/Supabase basics.
- **No full file dumps**. Use `@file` references or diffs.
- **Code only**: Show only changed/new lines.

### 🎯 Task 1
Scaffold project structure + Supabase schema.
1. List required files (path only).
2. Write Supabase SQL for `resumes` table.
3. Create `lib/supabase.ts` client setup.

### 🔍 If Context Missing
Ask for **ONE** specific file. Do not guess.