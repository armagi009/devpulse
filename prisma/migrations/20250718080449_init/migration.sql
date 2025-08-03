-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "selectedRepositories" TEXT[] DEFAULT ARRAY[]::TEXT[];
