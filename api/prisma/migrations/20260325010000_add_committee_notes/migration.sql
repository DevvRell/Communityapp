-- CreateTable
CREATE TABLE IF NOT EXISTS "committee_notes" (
    "id" SERIAL NOT NULL,
    "committeeName" TEXT NOT NULL,
    "meetingDate" DATE NOT NULL,
    "meetingLocation" TEXT,
    "callToOrderTime" TEXT NOT NULL,
    "adjournmentTime" TEXT,
    "chairperson" TEXT NOT NULL,
    "membersPresent" TEXT NOT NULL,
    "membersAbsent" TEXT,
    "guests" TEXT,
    "quorumReached" BOOLEAN NOT NULL DEFAULT true,
    "agendaItems" JSONB NOT NULL,
    "motions" JSONB,
    "actionItems" JSONB,
    "publicComment" TEXT,
    "generalNotes" TEXT,
    "submittedBy" TEXT NOT NULL,
    "submitterEmail" TEXT NOT NULL,
    "attachments" JSONB,
    "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committee_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "committee_notes_committeeName_idx" ON "committee_notes"("committeeName");
CREATE INDEX IF NOT EXISTS "committee_notes_meetingDate_idx" ON "committee_notes"("meetingDate");
CREATE INDEX IF NOT EXISTS "committee_notes_submissionStatus_idx" ON "committee_notes"("submissionStatus");
