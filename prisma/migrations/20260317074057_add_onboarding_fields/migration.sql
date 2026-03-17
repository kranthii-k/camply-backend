-- AlterTable
ALTER TABLE "User" ADD COLUMN     "hackathonsCount" TEXT,
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false;
