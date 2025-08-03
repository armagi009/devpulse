-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "burnoutAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "language" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorDate" TIMESTAMP(3) NOT NULL,
    "committerName" TEXT NOT NULL,
    "committerEmail" TEXT NOT NULL,
    "committerDate" TIMESTAMP(3) NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequest" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "mergedAt" TIMESTAMP(3),
    "repositoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changedFiles" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "reviewComments" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PullRequestReview" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "pullRequestId" TEXT NOT NULL,
    "reviewer" TEXT NOT NULL,
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PullRequestReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "repositoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "labels" TEXT[],

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BurnoutMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "commitsCount" INTEGER NOT NULL DEFAULT 0,
    "linesAdded" INTEGER NOT NULL DEFAULT 0,
    "linesDeleted" INTEGER NOT NULL DEFAULT 0,
    "prsOpened" INTEGER NOT NULL DEFAULT 0,
    "prsReviewed" INTEGER NOT NULL DEFAULT 0,
    "issuesCreated" INTEGER NOT NULL DEFAULT 0,
    "issuesResolved" INTEGER NOT NULL DEFAULT 0,
    "avgCommitTimeHour" DECIMAL(5,2),
    "weekendCommits" INTEGER NOT NULL DEFAULT 0,
    "lateNightCommits" INTEGER NOT NULL DEFAULT 0,
    "avgPrReviewTimeHours" DECIMAL(10,2),
    "avgCommitMessageLength" INTEGER,
    "codeReviewComments" INTEGER NOT NULL DEFAULT 0,
    "burnoutRiskScore" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BurnoutMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInsight" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalPrs" INTEGER NOT NULL DEFAULT 0,
    "totalIssues" INTEGER NOT NULL DEFAULT 0,
    "velocityScore" DECIMAL(5,2) NOT NULL,
    "prMergeRate" DECIMAL(5,2) NOT NULL,
    "issueResolutionRate" DECIMAL(5,2) NOT NULL,
    "cycleTimeAverage" DECIMAL(10,2) NOT NULL,
    "collaborationScore" DECIMAL(5,2) NOT NULL,
    "knowledgeSharingScore" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retrospective" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "positives" TEXT[],
    "improvements" TEXT[],
    "actionItems" TEXT[],
    "teamHealthScore" DECIMAL(5,2) NOT NULL,
    "observations" TEXT[],
    "recommendations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retrospective_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE INDEX "User_githubId_idx" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_githubId_key" ON "Repository"("githubId");

-- CreateIndex
CREATE INDEX "Repository_ownerId_idx" ON "Repository"("ownerId");

-- CreateIndex
CREATE INDEX "Commit_repositoryId_idx" ON "Commit"("repositoryId");

-- CreateIndex
CREATE INDEX "Commit_authorId_idx" ON "Commit"("authorId");

-- CreateIndex
CREATE INDEX "Commit_authorDate_idx" ON "Commit"("authorDate");

-- CreateIndex
CREATE UNIQUE INDEX "Commit_repositoryId_sha_key" ON "Commit"("repositoryId", "sha");

-- CreateIndex
CREATE INDEX "PullRequest_repositoryId_idx" ON "PullRequest"("repositoryId");

-- CreateIndex
CREATE INDEX "PullRequest_authorId_idx" ON "PullRequest"("authorId");

-- CreateIndex
CREATE INDEX "PullRequest_state_idx" ON "PullRequest"("state");

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_repositoryId_number_key" ON "PullRequest"("repositoryId", "number");

-- CreateIndex
CREATE INDEX "PullRequestReview_pullRequestId_idx" ON "PullRequestReview"("pullRequestId");

-- CreateIndex
CREATE INDEX "PullRequestReview_reviewerId_idx" ON "PullRequestReview"("reviewerId");

-- CreateIndex
CREATE INDEX "Issue_repositoryId_idx" ON "Issue"("repositoryId");

-- CreateIndex
CREATE INDEX "Issue_authorId_idx" ON "Issue"("authorId");

-- CreateIndex
CREATE INDEX "Issue_state_idx" ON "Issue"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_repositoryId_number_key" ON "Issue"("repositoryId", "number");

-- CreateIndex
CREATE INDEX "BurnoutMetric_userId_date_idx" ON "BurnoutMetric"("userId", "date");

-- CreateIndex
CREATE INDEX "BurnoutMetric_repositoryId_date_idx" ON "BurnoutMetric"("repositoryId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "BurnoutMetric_userId_repositoryId_date_key" ON "BurnoutMetric"("userId", "repositoryId", "date");

-- CreateIndex
CREATE INDEX "TeamInsight_repositoryId_date_idx" ON "TeamInsight"("repositoryId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInsight_repositoryId_date_key" ON "TeamInsight"("repositoryId", "date");

-- CreateIndex
CREATE INDEX "Retrospective_repositoryId_idx" ON "Retrospective"("repositoryId");

-- CreateIndex
CREATE INDEX "Retrospective_startDate_endDate_idx" ON "Retrospective"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PullRequestReview" ADD CONSTRAINT "PullRequestReview_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BurnoutMetric" ADD CONSTRAINT "BurnoutMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BurnoutMetric" ADD CONSTRAINT "BurnoutMetric_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInsight" ADD CONSTRAINT "TeamInsight_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
