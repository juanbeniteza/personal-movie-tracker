import type { MovieWatch } from "@/types"

export interface DayGroup {
  day: number
  movies: MovieWatch[]
}

export interface MonthGroup {
  month: number // 0-based (Jan = 0)
  monthName: string
  days: DayGroup[]
}

export interface YearGroup {
  year: number
  months: MonthGroup[]
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function groupMoviesByDate(movies: MovieWatch[]): YearGroup[] {
  // Sort newest first
  const sorted = [...movies].sort(
    (a, b) =>
      new Date(b.watchDate).getTime() - new Date(a.watchDate).getTime()
  )

  const map = new Map<number, Map<number, Map<number, MovieWatch[]>>>()

  for (const movie of sorted) {
    const d = new Date(movie.watchDate)
    const y = d.getUTCFullYear()
    const m = d.getUTCMonth()
    const day = d.getUTCDate()

    if (!map.has(y)) map.set(y, new Map())
    if (!map.get(y)!.has(m)) map.get(y)!.set(m, new Map())
    if (!map.get(y)!.get(m)!.has(day)) map.get(y)!.get(m)!.set(day, [])
    map.get(y)!.get(m)!.get(day)!.push(movie)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b - a) // newest year first
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .sort(([a], [b]) => b - a) // newest month first
        .map(([month, dayMap]) => ({
          month,
          monthName: MONTHS[month],
          days: Array.from(dayMap.entries())
            .sort(([a], [b]) => b - a) // newest day first
            .map(([day, movies]) => ({ day, movies })),
        })),
    }))
}
