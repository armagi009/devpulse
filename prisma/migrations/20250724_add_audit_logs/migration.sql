-- Check if AuditLog table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'AuditLog') THEN
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

        -- CreateIndex
        CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
        CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
        CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
        CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

        -- AddForeignKey
        ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;