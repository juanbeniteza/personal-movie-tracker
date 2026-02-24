import { NextRequest, NextResponse } from "next/server"
import { searchMovieResults } from "@/lib/tmdb"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  const results = await searchMovieResults(q)
  return NextResponse.json({ results })
}
