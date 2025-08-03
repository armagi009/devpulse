-- Fix the role field to match the schema
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';