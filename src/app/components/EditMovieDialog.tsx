"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { XIcon } from "lucide-react"
import { editMovieAction } from "@/lib/actions"
import type { MovieWatch } from "@/types"

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

function utcDateToInputValue(isoString: string): string {
  const d = new Date(isoString)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

interface Props {
  movie: MovieWatch
  onClose: () => void
}

export default function EditMovieDialog({ movie, onClose }: Props) {
  const router = useRouter()
  const [platform, setPlatform] = useState(movie.platform)
  const [watchDate, setWatchDate] = useState(utcDateToInputValue(movie.watchDate))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    const result = await editMovieAction(movie.id, { platform, watchDate })
    if (result.ok) {
      router.refresh()
      onClose()
    } else {
      setError("Unlock first via + Add Film")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold uppercase tracking-widest">Edit Film</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
            <XIcon className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Film summary */}
          <div className="flex items-center gap-3">
            {movie.posterUrl && (
              <div className="relative aspect-[2/3] w-10 shrink-0 overflow-hidden">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-sm font-semibold">{movie.title}</p>
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

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 text-xs font-medium uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hover:opacity-80 disabled:opacity-40 transition-opacity"
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}
