export interface TmdbResult {
  tmdbId: number | null
  posterUrl: string
}

export interface TmdbSearchResult {
  tmdbId: number
  title: string
  year: string | null
  posterUrl: string | null
}

// Used by the iOS Shortcut API — returns the single best match
export async function searchMovie(
  title: string,
  year?: string
): Promise<TmdbResult> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return { tmdbId: null, posterUrl: "" }

  const params = new URLSearchParams({ api_key: apiKey, query: title })
  if (year) params.set("year", year)
  const url = `https://api.themoviedb.org/3/search/movie?${params}`

  try {
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) return { tmdbId: null, posterUrl: "" }

    const data = await res.json()
    const first = data.results?.[0]
    if (!first) return { tmdbId: null, posterUrl: "" }

    return {
      tmdbId: first.id ?? null,
      posterUrl: first.poster_path
        ? `https://image.tmdb.org/t/p/w500${first.poster_path}`
        : "",
    }
  } catch {
    return { tmdbId: null, posterUrl: "" }
  }
}

// Used by the web search endpoint — returns top results for user to choose from
export async function searchMovieResults(
  title: string
): Promise<TmdbSearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return []

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&page=1`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results ?? []).slice(0, 8).map((m: any) => ({
      tmdbId: m.id,
      title: m.title,
      year: m.release_date ? (m.release_date as string).slice(0, 4) : null,
      posterUrl: m.poster_path
        ? `https://image.tmdb.org/t/p/w185${m.poster_path}`
        : null,
    }))
  } catch {
    return []
  }
}
