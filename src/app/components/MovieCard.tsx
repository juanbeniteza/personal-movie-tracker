"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { PencilIcon, Trash2Icon, CheckIcon, XIcon } from "lucide-react"
import { deleteMovieAction } from "@/lib/actions"
import type { MovieWatch } from "@/types"
import EditMovieDialog from "./EditMovieDialog"

interface Props {
  movie: MovieWatch
  sizes?: string
}

export default function MovieCard({
  movie,
  sizes = "(max-width: 640px) 33vw, 16vw",
}: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [authError, setAuthError] = useState(false)

  function handleCardClick() {
    setMenuOpen(true)
    setConfirmDelete(false)
    setAuthError(false)
  }

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteMovieAction(movie.id)
    if (result.ok) {
      router.refresh()
    } else {
      setAuthError(true)
      setConfirmDelete(false)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <div
          className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 cursor-pointer"
          onClick={handleCardClick}
        >
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              sizes={sizes}
              className="object-cover transition-opacity duration-300"
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-2">
              <span className="text-center text-xs leading-tight text-zinc-400">
                {movie.title}
              </span>
            </div>
          )}

          {/* Click overlay */}
          {menuOpen && (
            <div
              className="absolute inset-0 z-50 bg-black/70 flex flex-col items-center justify-center gap-3"
              onClick={() => { setMenuOpen(false); setConfirmDelete(false) }}
            >
              {authError ? (
                <p className="text-[10px] text-white text-center px-2">Unlock first via&nbsp;+ Add Film</p>
              ) : confirmDelete ? (
                <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center justify-center w-9 h-9 bg-red-500 text-white disabled:opacity-50"
                    aria-label="Confirm delete"
                  >
                    <CheckIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex items-center justify-center w-9 h-9 bg-white/20 text-white"
                    aria-label="Cancel"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditOpen(true); setMenuOpen(false) }}
                    className="flex items-center justify-center w-9 h-9 bg-white/20 text-white hover:bg-white/30 transition-colors"
                    aria-label="Edit"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center justify-center w-9 h-9 bg-white/20 text-white hover:bg-white/30 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="truncate text-xs font-medium leading-tight">{movie.title}</p>
        <p className="truncate text-xs text-zinc-400">{movie.platform}</p>
        <p className="truncate text-xs text-zinc-300 dark:text-zinc-600">
          {new Date(movie.watchDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          })}
        </p>
      </div>

      {/* Fullscreen backdrop — closes menu when clicking anywhere outside the card */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setMenuOpen(false); setConfirmDelete(false) }}
        />
      )}

      {editOpen && (
        <EditMovieDialog
          movie={movie}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  )
}
