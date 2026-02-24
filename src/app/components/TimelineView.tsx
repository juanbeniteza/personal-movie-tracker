"use client"

import { useState } from "react"
import MovieCard from "./MovieCard"
import type { YearGroup } from "@/lib/groupMovies"

interface Props {
  grouped: YearGroup[]
}

export default function TimelineView({ grouped }: Props) {
  const [selectedYear, setSelectedYear] = useState<number>(
    grouped[0]?.year ?? new Date().getFullYear()
  )

  if (grouped.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No movies logged yet. Add one via the API or the button above.
      </p>
    )
  }

  const active = grouped.find(g => g.year === selectedYear) ?? grouped[0]

  return (
    <div>
      {/* Year selector — big active year + smaller others on the side */}
      <div className="flex items-start gap-6 mb-10">
        <h2 className="select-none text-[3.5rem] sm:text-[5rem] md:text-[7rem] font-black leading-none tracking-tighter text-zinc-100 dark:text-zinc-800">
          {active.year}
        </h2>
        {grouped.filter(({ year }) => year !== selectedYear).length > 0 && (
          <div className="flex flex-col gap-2 pt-3">
            {grouped
              .filter(({ year }) => year !== selectedYear)
              .map(({ year }) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className="text-sm font-bold tracking-tight text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-left"
                >
                  {year}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Months for selected year */}
      <div className="space-y-14">
        {active.months.map(({ month, monthName, days }) => (
          <div key={month}>
            <h3 className="mb-6 text-base font-bold uppercase tracking-widest">
              {monthName}
            </h3>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {days.flatMap(({ movies }) =>
                movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
