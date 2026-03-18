-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('CAMPLY_INTERNAL', 'PARTNER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlacementDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('INTERVIEW', 'ONLINE_TEST', 'GROUP_DISCUSSION');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "compensationType" TEXT NOT NULL,
    "compensationNote" TEXT NOT NULL,
    "perks" TEXT[],
    "requirements" TEXT[],
    "applyEmail" TEXT NOT NULL,
    "applySubject" TEXT NOT NULL,
    "source" "JobSource" NOT NULL DEFAULT 'PARTNER',
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "submitterNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerTest" (
    "id" TEXT NOT NULL,
    "platformName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "testLink" TEXT NOT NULL,
    "registrationLink" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementPost" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyLogo" TEXT,
    "role" TEXT NOT NULL,
    "package" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "difficulty" "PlacementDifficulty" NOT NULL,
    "type" "PlacementType" NOT NULL,
    "college" TEXT NOT NULL,
    "tags" TEXT[],
    "preview" TEXT NOT NULL,
    "authorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementUpvote" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacementUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlacementComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_status_isPinned_createdAt_idx" ON "Job"("status", "isPinned", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Job_source_status_idx" ON "Job"("source", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Job_companyName_role_key" ON "Job"("companyName", "role");

-- CreateIndex
CREATE INDEX "PartnerTest_isActive_priority_createdAt_idx" ON "PartnerTest"("isActive", "priority" DESC, "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerTest_platformName_title_key" ON "PartnerTest"("platformName", "title");

-- CreateIndex
CREATE INDEX "PlacementPost_type_createdAt_idx" ON "PlacementPost"("type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PlacementPost_authorId_idx" ON "PlacementPost"("authorId");

-- CreateIndex
CREATE INDEX "PlacementPost_isActive_createdAt_idx" ON "PlacementPost"("isActive", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PlacementUpvote_postId_idx" ON "PlacementUpvote"("postId");

-- CreateIndex
CREATE INDEX "PlacementUpvote_userId_idx" ON "PlacementUpvote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlacementUpvote_postId_userId_key" ON "PlacementUpvote"("postId", "userId");

-- CreateIndex
CREATE INDEX "PlacementComment_postId_idx" ON "PlacementComment"("postId");

-- AddForeignKey
ALTER TABLE "PlacementPost" ADD CONSTRAINT "PlacementPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementUpvote" ADD CONSTRAINT "PlacementUpvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PlacementPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementUpvote" ADD CONSTRAINT "PlacementUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementComment" ADD CONSTRAINT "PlacementComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "PlacementPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlacementComment" ADD CONSTRAINT "PlacementComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
