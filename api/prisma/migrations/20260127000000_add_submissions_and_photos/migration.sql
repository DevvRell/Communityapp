-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "businesses" ADD COLUMN "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "complaints" ADD COLUMN "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "events" ADD COLUMN "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "submittedBy" TEXT,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "businesses_submissionStatus_idx" ON "businesses"("submissionStatus");

-- CreateIndex
CREATE INDEX "complaints_submissionStatus_idx" ON "complaints"("submissionStatus");

-- CreateIndex
CREATE INDEX "events_submissionStatus_idx" ON "events"("submissionStatus");

-- CreateIndex
CREATE INDEX "photos_submissionStatus_idx" ON "photos"("submissionStatus");
