-- Make existing required fields optional and add new ENY directory fields
ALTER TABLE "businesses"
  ALTER COLUMN "description" DROP NOT NULL,
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "hours" DROP NOT NULL,
  ADD COLUMN "website"      TEXT,
  ADD COLUMN "borough"      TEXT,
  ADD COLUMN "zip"          TEXT,
  ADD COLUMN "sub_category" TEXT;
