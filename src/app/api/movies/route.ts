import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { searchMovie } from "@/lib/tmdb"
import type { CreateMovieBody } from "@/types"

export async function POST(request: NextRequest) {
  // Auth check — compare against static Bearer token
  const auth = request.headers.get("authorization")
  const token = process.env.API_ROUTE_TOKEN
  if (!token || !auth || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Parse body
  let body: CreateMovieBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { title, platform, watchDate, year } = body as CreateMovieBody & { year?: string }
  if (!title || !platform) {
    return NextResponse.json(
      { error: "title and platform are required" },
      { status: 400 }
    )
  }

  // Resolve watch date — default to today
  const resolvedDate = watchDate ? new Date(watchDate) : new Date()
  if (isNaN(resolvedDate.getTime())) {
    return NextResponse.json(
      { error: "Invalid watchDate — use ISO 8601 format" },
      { status: 400 }
    )
  }

  // Fetch poster and metadata from TMDB
  const { tmdbId, posterUrl } = await searchMovie(title, year)

  // Persist to database
  try {
    const movie = await prisma.movieWatch.create({
      data: {
        title,
        watchDate: resolvedDate,
        platform,
        tmdbId,
        posterUrl,
      },
    })
    return NextResponse.json(movie, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to save to database" },
      { status: 500 }
    )
  }
}
