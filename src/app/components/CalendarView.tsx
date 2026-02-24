"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type { MovieWatch } from "@/types"

interface Props {
  movies: MovieWatch[]
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function toDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`
}

function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid: (number | null)[] = Array(firstDayOfWeek).fill(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(d)
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

export default function CalendarView({ movies }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth())
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Map from "year-month-day" → MovieWatch[]
  const moviesByDay = useMemo(() => {
    const map = new Map<string, MovieWatch[]>()
    for (const m of movies) {
      const d = new Date(m.watchDate)
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return map
  }, [movies])

  const grid = useMemo(() => getMonthGrid(year, month), [year, month])

  const selectedMovies = selectedKey ? (moviesByDay.get(selectedKey) ?? []) : []

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedKey(null)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedKey(null)
  }

  function handleDayClick(day: number) {
    const key = `${year}-${month}-${day}`
    if (!moviesByDay.has(key)) return
    setSelectedKey(prev => prev === key ? null : key)
  }

  const todayKey = toDateKey(now)

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={prevMonth}
          className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <h2 className="w-44 text-center text-sm font-bold uppercase tracking-widest">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          aria-label="Next month"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-zinc-100 dark:bg-zinc-800">
        {grid.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="bg-white dark:bg-black min-h-28" />
          }

          const key = `${year}-${month}-${day}`
          const dayMovies = moviesByDay.get(key) ?? []
          const hasMovies = dayMovies.length > 0
          const isToday = key === todayKey
          const isSelected = selectedKey === key

          return (
            <div
              key={key}
              onClick={() => handleDayClick(day)}
              className={[
                "relative bg-white dark:bg-black min-h-28 p-1.5 flex flex-col gap-1",
                hasMovies ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950" : "",
                isSelected ? "ring-2 ring-inset ring-black dark:ring-white" : "",
              ].join(" ")}
            >
              {/* Day number */}
              <span className={[
                "self-start text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full shrink-0",
                isToday
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-500 dark:text-zinc-400",
              ].join(" ")}>
                {day}
              </span>

              {/* Movie posters */}
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {dayMovies.slice(0, 3).map((movie) => (
                  <div
                    key={movie.id}
                    className="relative aspect-[2/3] w-8 overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0"
                  >
                    {movie.posterUrl ? (
                      <Image
                        src={movie.posterUrl}
                        alt={movie.title}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-0.5">
                        <span className="text-[8px] leading-tight text-zinc-400 text-center">
                          {movie.title.slice(0, 10)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {dayMovies.length > 3 && (
                  <span className="text-[10px] text-zinc-400 self-end leading-none">
                    +{dayMovies.length - 3}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel — expands below the grid on day click */}
      {selectedMovies.length > 0 && selectedKey && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <p className="mb-5 text-xs uppercase tracking-widest text-zinc-400">
            {new Date(
              Date.UTC(year, month, parseInt(selectedKey.split("-")[2]))
            ).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
          <div className="flex flex-wrap gap-6">
            {selectedMovies.map((movie) => (
              <div key={movie.id} className="flex items-start gap-3">
                {movie.posterUrl && (
                  <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{movie.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">{movie.platform}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
