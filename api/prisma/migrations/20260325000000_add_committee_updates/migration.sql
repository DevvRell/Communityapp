-- CreateTable
CREATE TABLE IF NOT EXISTS "committee_updates" (
    "id" SERIAL NOT NULL,
    "committeeName" TEXT NOT NULL,
    "meetingDate" DATE NOT NULL,
    "agenda" TEXT NOT NULL,
    "minutes" TEXT NOT NULL,
    "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committee_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "committee_updates_committeeName_idx" ON "committee_updates"("committeeName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "committee_updates_meetingDate_idx" ON "committee_updates"("meetingDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "committee_updates_submissionStatus_idx" ON "committee_updates"("submissionStatus");
