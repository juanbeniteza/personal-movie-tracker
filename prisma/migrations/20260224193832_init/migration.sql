-- CreateTable
CREATE TABLE "MovieWatch" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "watchDate" TIMESTAMP(3) NOT NULL,
    "platform" TEXT NOT NULL,
    "tmdbId" INTEGER,
    "posterUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovieWatch_pkey" PRIMARY KEY ("id")
);
