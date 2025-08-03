-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DEVELOPER', 'TEAM_LEAD', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('MEMBER', 'LEAD', 'ADMIN');

-- CreateEnum
CREATE TYPE "DataPrivacySettings" AS ENUM ('MINIMAL', 'STANDARD', 'DETAILED');

-- CreateEnum
CREATE TYPE "AppModeType" AS ENUM ('LIVE', 'MOCK', 'DEMO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'DEVELOPER';

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN "dashboardLayout" JSONB,
ADD COLUMN "dataPrivacy" "DataPrivacySettings" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRepository" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "lastModifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppMode" (
    "id" TEXT NOT NULL,
    "mode" "AppModeType" NOT NULL DEFAULT 'LIVE',
    "mockDataSetId" TEXT,
    "enabledFeatures" TEXT[],
    "errorSimulation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermissionToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamRepository_teamId_repositoryId_key" ON "TeamRepository"("teamId", "repositoryId");

-- CreateIndex
CREATE INDEX "TeamRepository_teamId_idx" ON "TeamRepository"("teamId");

-- CreateIndex
CREATE INDEX "TeamRepository_repositoryId_idx" ON "TeamRepository"("repositoryId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_key_key" ON "SystemSettings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToUser_AB_unique" ON "_PermissionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToUser_B_index" ON "_PermissionToUser"("B");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRepository" ADD CONSTRAINT "TeamRepository_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRepository" ADD CONSTRAINT "TeamRepository_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToUser" ADD CONSTRAINT "_PermissionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default permissions
INSERT INTO "Permission" (id, name, description, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'view:personal_metrics', 'View personal productivity metrics', NOW(), NOW()),
  (gen_random_uuid(), 'view:team_metrics', 'View team productivity metrics', NOW(), NOW()),
  (gen_random_uuid(), 'view:burnout_personal', 'View personal burnout metrics', NOW(), NOW()),
  (gen_random_uuid(), 'view:burnout_team', 'View team burnout metrics', NOW(), NOW()),
  (gen_random_uuid(), 'manage:repositories', 'Manage repository connections', NOW(), NOW()),
  (gen_random_uuid(), 'manage:teams', 'Manage teams and members', NOW(), NOW()),
  (gen_random_uuid(), 'create:retrospectives', 'Create team retrospectives', NOW(), NOW()),
  (gen_random_uuid(), 'admin:users', 'Manage user accounts', NOW(), NOW()),
  (gen_random_uuid(), 'admin:system', 'Manage system settings', NOW(), NOW()),
  (gen_random_uuid(), 'admin:mock_mode', 'Toggle and configure mock mode', NOW(), NOW());

-- Create default system settings
INSERT INTO "SystemSettings" (id, key, value, description, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'default_role', 'DEVELOPER', 'Default role for new users', NOW(), NOW()),
  (gen_random_uuid(), 'enable_burnout_alerts', 'true', 'Enable burnout alert notifications', NOW(), NOW()),
  (gen_random_uuid(), 'burnout_threshold', '70', 'Threshold for burnout alerts (0-100)', NOW(), NOW()),
  (gen_random_uuid(), 'enable_mock_mode', 'false', 'Enable mock mode for development', NOW(), NOW());

-- Create default app mode
INSERT INTO "AppMode" (id, mode, "enabledFeatures", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'LIVE', ARRAY['dashboard', 'productivity', 'team', 'burnout', 'retrospectives'], NOW(), NOW());