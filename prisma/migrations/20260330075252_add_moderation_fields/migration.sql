-- AlterEnum
ALTER TYPE "HackathonSource" ADD VALUE 'DEVFOLIO';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderationReason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannedUntil" TIMESTAMP(3),
ADD COLUMN     "lastViolationAt" TIMESTAMP(3),
ADD COLUMN     "violationCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Post_isFlagged_idx" ON "Post"("isFlagged");
