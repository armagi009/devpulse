/*
  Warnings:

  - The `dataPrivacy` column on the `UserSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamRepository` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeamRepository" DROP CONSTRAINT "TeamRepository_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "TeamRepository" DROP CONSTRAINT "TeamRepository_teamId_fkey";

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'DEVELOPER';

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "dataPrivacy",
ADD COLUMN     "dataPrivacy" TEXT NOT NULL DEFAULT 'STANDARD';

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "TeamRepository";

-- DropEnum
DROP TYPE "DataPrivacySettings";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "TeamRole";
