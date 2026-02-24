// Client-safe shape of a MovieWatch DB row.
// Dates are ISO strings after crossing the server/client boundary.
export interface MovieWatch {
  id: string
  title: string
  watchDate: string
  platform: string
  tmdbId: number | null
  posterUrl: string
  createdAt: string
}

// Request body shape for POST /api/movies
export interface CreateMovieBody {
  title: string
  watchDate?: string // ISO date string; defaults to today if absent
  platform: string
}

// The two possible frontend views
export type ViewMode = "timeline" | "calendar"
