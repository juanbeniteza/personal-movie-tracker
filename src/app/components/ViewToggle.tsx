"use client"

import { useState } from "react"
import TimelineView from "./TimelineView"
import CalendarView from "./CalendarView"
import type { MovieWatch, ViewMode } from "@/types"
import type { YearGroup } from "@/lib/groupMovies"

interface Props {
  movies: MovieWatch[]
  grouped: YearGroup[]
}

export default function ViewToggle({ movies, grouped }: Props) {
  const [view, setView] = useState<ViewMode>("timeline")

  return (
    <div>
      {/* Swiss minimalist toggle — underline style, no borders */}
      <div className="mb-10 flex gap-6">
        <button
          onClick={() => setView("timeline")}
          className={`text-xs font-medium uppercase tracking-widest pb-1 transition-all border-b-2 ${
            view === "timeline"
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          List
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`text-xs font-medium uppercase tracking-widest pb-1 transition-all border-b-2 ${
            view === "calendar"
              ? "border-black dark:border-white text-black dark:text-white"
              : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
        >
          Calendar
        </button>
      </div>

      {view === "timeline" ? (
        <TimelineView grouped={grouped} />
      ) : (
        <CalendarView movies={movies} />
      )}
    </div>
  )
}
