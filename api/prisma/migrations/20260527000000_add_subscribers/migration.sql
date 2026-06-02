-- CreateTable
CREATE TABLE IF NOT EXISTS "subscribers" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "subscribers_createdAt_idx" ON "subscribers"("createdAt");
