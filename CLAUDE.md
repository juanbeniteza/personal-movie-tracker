# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma migrate deploy              # Apply migrations to production (Neon)
npx prisma generate                    # Regenerate Prisma client after schema changes
```

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string (use pooled `-pooler.neon.tech` URL in production)
- `TMDB_API_KEY` — TMDB v3 API key
- `API_ROUTE_TOKEN` — Bearer token for `POST /api/movies` (iOS Shortcut)
- `ADD_PASSWORD` — Password for web UI add/edit/delete auth

## Architecture

### Data Flow

```
Neon PostgreSQL
    │ prisma.movieWatch.findMany()
    ▼
page.tsx (Server Component, force-dynamic)
    │ serialize Date→ISO string, run groupMoviesByDate()
    ▼
ViewToggle.tsx (client — owns viewMode state)
    ├── grouped: YearGroup[]  ──►  TimelineView (year selector + poster grid)
    └── movies: MovieWatch[]  ──►  CalendarView (custom month grid)
```

No client-side data fetching — all data flows top-down from the server component via props.

### Prisma v7 — Critical Notes

- Generator is `provider = "prisma-client"` (not `prisma-client-js`)
- Client output is `src/generated/prisma` — import from `@/generated/prisma/client`
- **Requires a driver adapter** — `PrismaNeon` from `@prisma/adapter-neon` is passed to `new PrismaClient({ adapter })`
- `prisma.config.ts` loads `.env.local` then `.env` so the CLI picks up the right `DATABASE_URL`

### Authentication

Web UI mutations (add/edit/delete) use a cookie-based password gate:
- `unlockAction(password)` validates against `ADD_PASSWORD` env var, sets an `httpOnly` cookie (`movie_auth`) valid for 30 days
- All mutating server actions (`addMovieAction`, `editMovieAction`, `deleteMovieAction`) check that cookie and return `{ ok: false, error: "unauthorized" }` instead of throwing (to avoid 500s)
- `POST /api/movies` uses a separate `Authorization: Bearer <API_ROUTE_TOKEN>` header (for iOS Shortcut)

### Date Handling

All dates are stored as UTC midnight (`T00:00:00.000Z`). Always use UTC methods throughout:
- `getUTCFullYear()`, `getUTCMonth()`, `getUTCDate()` for grouping/comparisons
- `timeZone: "UTC"` in `toLocaleDateString()` for display
- Date inputs are formatted as `YYYY-MM-DD` strings and parsed back to UTC midnight in actions

### Key Files

| File | Purpose |
|---|---|
| `src/lib/prisma.ts` | Prisma singleton with Neon adapter |
| `src/lib/actions.ts` | All server actions (auth + CRUD) |
| `src/lib/tmdb.ts` | TMDB search — `searchMovie()` (single) and `searchMovieResults()` (top 8) |
| `src/lib/groupMovies.ts` | Groups `MovieWatch[]` → `YearGroup[]` hierarchy using UTC dates |
| `src/types/index.ts` | Shared TS types — `MovieWatch` uses ISO strings for dates (not `Date` objects) |
| `src/app/api/movies/route.ts` | `POST /api/movies` — Bearer token auth, TMDB lookup, saves to DB |
| `src/app/api/movies/search/route.ts` | `GET /api/movies/search?q=` — TMDB proxy, no auth |
| `prisma.config.ts` | Prisma CLI config — loads `.env.local` for migrations |

### TMDB Images

`next.config.ts` allows `image.tmdb.org/t/p/**`. Thumbnails use `/w185/`, stored posters use `/w500/` (upgrade happens in `AddMovieDialog` before calling the action).
