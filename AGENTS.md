# AGENTS.md

## Project Goal
This is a full-stack fintech web application.
The goal is to build a market dashboard for currencies and financial assets,
including watchlists and basic user data. This project is portfolio-focused.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Backend: Next.js API routes
- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth (basic setup)
- Package manager: pnpm

## How to run the project
- Install dependencies: `pnpm install`
- Run database locally (Postgres)
- Apply Prisma schema: `pnpm prisma migrate dev`
- Run dev server: `pnpm dev`
- App runs on: http://localhost:3000

## Scope & Constraints
- Keep backend simple and minimal
- No complex business logic
- Focus on clean architecture and clarity
- Security best practices (no secrets in code)

## Backend Rules
- Use `/app/api` for API routes
- Validate inputs with Zod
- Database access only through Prisma
- No raw SQL unless necessary
- API routes should be small and focused

## Frontend Rules
- Use server components by default
- Client components only when state is needed
- Components go in `/components`
- Pages and layouts stay in `/app`

## Folder Structure Rules
- `/app` → pages, layouts, and API routes
- `/components` → reusable UI components
- `/lib` → helpers, db, auth, validators
- `/prisma` → Prisma schema and migrations

## Styling Rules
- Tailwind CSS only
- No inline styles
- Support light and dark mode
- Use consistent spacing and typography

## What NOT to do
- Do not introduce unnecessary libraries
- Do not over-engineer the backend
- Do not add features outside MVP scope
- Do not refactor unrelated code

## AI Behavior Rules
- Follow these instructions strictly
- Explain assumptions clearly
- Ask before making architectural changes
- Prefer simple, readable solutions
