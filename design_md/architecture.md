# Architecture

## Flow
User → Chat UI (Client) → API Route (Server) → Supabase + GitHub

## State Management
- Client: Zustand/Context (chat history, current step)
- Server: Supabase (persistent storage)

## Auth
- None (Public submission) OR Supabase Auth (if user accounts needed)