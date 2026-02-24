"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function unlockAction(password: string): Promise<{ ok: boolean }> {
  if (password === process.env.ADD_PASSWORD) {
    const store = await cookies()
    store.set("movie_auth", process.env.ADD_PASSWORD!, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    return { ok: true }
  }
  return { ok: false }
}

type Result = { ok: boolean; error?: string }

function unauthorized(): Result {
  return { ok: false, error: "unauthorized" }
}

export async function addMovieAction(data: {
  title: string
  tmdbId: number | null
  posterUrl: string
  platform: string
  watchDate: string // YYYY-MM-DD
}): Promise<Result> {
  const store = await cookies()
  if (store.get("movie_auth")?.value !== process.env.ADD_PASSWORD) {
    return unauthorized()
  }

  // Parse as UTC midnight — consistent with how we display dates
  const watchDate = new Date(`${data.watchDate}T00:00:00.000Z`)

  await prisma.movieWatch.create({
    data: {
      title: data.title,
      tmdbId: data.tmdbId,
      posterUrl: data.posterUrl,
      platform: data.platform,
      watchDate,
    },
  })

  revalidatePath("/")
  return { ok: true }
}

export async function deleteMovieAction(id: string): Promise<Result> {
  const store = await cookies()
  if (store.get("movie_auth")?.value !== process.env.ADD_PASSWORD) {
    return unauthorized()
  }
  await prisma.movieWatch.delete({ where: { id } })
  revalidatePath("/")
  return { ok: true }
}

export async function editMovieAction(
  id: string,
  data: { platform: string; watchDate: string }
): Promise<Result> {
  const store = await cookies()
  if (store.get("movie_auth")?.value !== process.env.ADD_PASSWORD) {
    return unauthorized()
  }
  await prisma.movieWatch.update({
    where: { id },
    data: {
      platform: data.platform,
      watchDate: new Date(`${data.watchDate}T00:00:00.000Z`),
    },
  })
  revalidatePath("/")
  return { ok: true }
}
