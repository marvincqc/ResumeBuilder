# ResumeBot Web Context

## Stack
- Next.js 14 (App Router)
- Supabase (DB + Auth)
- GitHub API (Mirror data)

## Flow
1. User lands → Chat UI initiates
2. Step 0: Lang Select (buttons)
3. Step 1-7: Q&A (text input)
4. Step 8: Review (confirm/edit)
5. Submit → Supabase + GitHub Commit

## Current State
- [ ] Scaffold
- [ ] Chat UI Component
- [ ] State Machine Hook
- [ ] Supabase Integration
- [ ] GitHub Mirror

## Rules
- Keep responses <300 tokens.
- Reference files by path.
- No webhook code.