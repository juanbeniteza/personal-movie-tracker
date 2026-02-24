import { prisma } from "@/lib/prisma"
import { groupMoviesByDate } from "@/lib/groupMovies"
import ViewToggle from "@/app/components/ViewToggle"
import AddMovieDialog from "@/app/components/AddMovieDialog"
import type { MovieWatch } from "@/types"

// Always fetch fresh — never serve a stale static page
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const raw = await prisma.movieWatch.findMany({
    orderBy: { watchDate: "desc" },
  })

  // Serialize Date objects → ISO strings before passing to client components
  const movies: MovieWatch[] = raw.map((m) => ({
    ...m,
    watchDate: m.watchDate.toISOString(),
    createdAt: m.createdAt.toISOString(),
  }))

  const grouped = groupMoviesByDate(movies)

  return (
    <main className="min-h-screen bg-white px-6 py-14 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Watched</h1>
            <p className="mt-1 text-xs text-zinc-400">
              {movies.length} {movies.length === 1 ? "film" : "films"} logged
            </p>
          </div>
          <AddMovieDialog />
        </header>
        <ViewToggle movies={movies} grouped={grouped} />
      </div>
    </main>
  )
}
