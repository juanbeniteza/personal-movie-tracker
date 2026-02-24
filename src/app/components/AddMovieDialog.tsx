"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { XIcon, SearchIcon, CheckIcon, LoaderIcon } from "lucide-react"
import { addMovieAction, unlockAction } from "@/lib/actions"
import type { TmdbSearchResult } from "@/lib/tmdb"

const PLATFORMS = [
  "Cinema",
  "Netflix",
  "Apple TV+",
  "HBO Max",
  "Amazon Prime",
  "Disney+",
  "Hulu",
  "Crunchyroll",
  "Jellyfin",
  "YouTube",
  "Other",
]

function localTodayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function AddMovieDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [selected, setSelected] = useState<TmdbSearchResult | null>(null)
  const [platform, setPlatform] = useState("Cinema")
  const [watchDate, setWatchDate] = useState(localTodayISO)
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  // Debounced TMDB search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } finally {
        setIsSearching(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  const close = useCallback(() => {
    setOpen(false)
    setPasswordInput("")
    setPasswordError(false)
    setQuery("")
    setResults([])
    setSelected(null)
    setPlatform("Cinema")
    setWatchDate(localTodayISO())
    // Preserve unlocked state within the same browser session
    setIsUnlocked(sessionStorage.getItem("movie_authed") === "1")
  }, [])

  function handleOpen() {
    setIsUnlocked(sessionStorage.getItem("movie_authed") === "1")
    setOpen(true)
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setIsUnlocking(true)
    setPasswordError(false)
    try {
      const result = await unlockAction(passwordInput)
      if (result.ok) {
        sessionStorage.setItem("movie_authed", "1")
        setIsUnlocked(true)
        setPasswordInput("")
      } else {
        setPasswordError(true)
      }
    } finally {
      setIsUnlocking(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !platform || !watchDate) return
    setIsSubmitting(true)
    const result = await addMovieAction({
      title: selected.title,
      tmdbId: selected.tmdbId,
      posterUrl: selected.posterUrl
        // Upgrade thumbnail URL to full-size poster for storage
        ? selected.posterUrl.replace("/w185/", "/w500/")
        : "",
      platform,
      watchDate,
    })
    setIsSubmitting(false)
    if (result.ok) {
      router.refresh()
      close()
    } else {
      // Cookie expired — force re-auth
      sessionStorage.removeItem("movie_authed")
      setIsUnlocked(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs font-medium uppercase tracking-widest border-b-2 border-black dark:border-white pb-0.5 hover:opacity-60 transition-opacity"
      >
        + Add Film
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h2 className="text-sm font-bold uppercase tracking-widest">Log a Film</h2>
              <button onClick={close} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                <XIcon className="size-4" />
              </button>
            </div>

            {/* Password step */}
            {!isUnlocked ? (
              <form onSubmit={handleUnlock} className="px-6 py-8 space-y-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-1.5">
                    Password
                  </label>
                  <input
                    autoFocus
                    type="password"
                    value={passwordInput}
                    onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
                    className="w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                  {passwordError && (
                    <p className="mt-1.5 text-xs text-red-500">Incorrect password.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isUnlocking || passwordInput.length === 0}
                  className="w-full py-2.5 text-xs font-medium uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-80 disabled:opacity-40 transition-opacity"
                >
                  {isUnlocking ? "Checking…" : "Unlock"}
                </button>
              </form>
            ) : (
              <div className="overflow-y-auto flex-1 min-h-30">
                {/* Search */}
                <div className="px-6 pt-5 pb-6">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search title..."
                      value={query}
                      onChange={e => { setQuery(e.target.value); setSelected(null) }}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                    {isSearching && (
                      <LoaderIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400 animate-spin" />
                    )}
                  </div>
                </div>

                {/* Idle hint */}
                {query.trim().length === 0 && (
                  <p className="px-6 -mt-3 text-xs text-zinc-400">
                    Search by title to find the right film on TMDB.
                  </p>
                )}

                {/* Results list */}
                {results.length > 0 && (
                  <ul className="px-6 pt-3 pb-1 space-y-1">
                    {results.map(result => {
                      const isSelected = selected?.tmdbId === result.tmdbId
                      return (
                        <li key={result.tmdbId}>
                          <button
                            type="button"
                            onClick={() => setSelected(result)}
                            className={[
                              "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                              isSelected
                                ? "bg-black text-white dark:bg-white dark:text-black"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
                            ].join(" ")}
                          >
                            {/* Thumbnail */}
                            <div className="relative aspect-[2/3] w-8 shrink-0 overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                              {result.posterUrl ? (
                                <Image
                                  src={result.posterUrl}
                                  alt={result.title}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <span className="text-[8px] text-zinc-400">?</span>
                                </div>
                              )}
                            </div>

                            {/* Title + year */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{result.title}</p>
                              {result.year && (
                                <p className={`text-xs ${isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"}`}>
                                  {result.year}
                                </p>
                              )}
                            </div>

                            {isSelected && <CheckIcon className="size-4 shrink-0" />}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* No results */}
                {!isSearching && query.trim().length >= 2 && results.length === 0 && (
                  <p className="px-6 pt-4 text-sm text-zinc-400">No results for &ldquo;{query}&rdquo;</p>
                )}

                {/* Form — visible once a film is selected */}
                {selected && (
                  <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 space-y-4 border-t border-zinc-100 dark:border-zinc-800 mt-3">
                    {/* Selected film summary */}
                    <div className="flex items-center gap-3">
                      {selected.posterUrl && (
                        <div className="relative aspect-[2/3] w-10 shrink-0 overflow-hidden">
                          <Image
                            src={selected.posterUrl}
                            alt={selected.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{selected.title}</p>
                        {selected.year && <p className="text-xs text-zinc-400">{selected.year}</p>}
                      </div>
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-1.5">
                        Platform
                      </label>
                      <select
                        value={platform}
                        onChange={e => setPlatform(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none"
                      >
                        {PLATFORMS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-1.5">
                        Date Watched
                      </label>
                      <input
                        type="date"
                        value={watchDate}
                        onChange={e => setWatchDate(e.target.value)}
                        required
                        className="w-full px-3 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 text-xs font-medium uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-80 disabled:opacity-40 transition-opacity"
                    >
                      {isSubmitting ? "Saving…" : "Log Film"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
