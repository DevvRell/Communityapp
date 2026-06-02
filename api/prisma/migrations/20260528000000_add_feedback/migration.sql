-- CreateTable
CREATE TABLE IF NOT EXISTS "feedback" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "category" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "feedback_createdAt_idx" ON "feedback"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "feedback_category_idx" ON "feedback"("category");
