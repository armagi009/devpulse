# CI/CD Pipeline Operational Guide

This guide provides step-by-step instructions to make the DevPulse CI/CD pipeline fully operational, including account setup, configuration, and verification.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub repository with admin access
- [ ] Local development environment set up
- [ ] Node.js 18+ installed
- [ ] Git configured with your GitHub account

## ⚠️ CRITICAL: Phase Dependencies

**FOLLOW THIS ORDER EXACTLY - Each phase depends on the previous ones:**

1. **Phase 1**: Local Environment → Must work locally first
2. **Phase 2**: Database/Infrastructure → Required for Vercel builds
3. **Phase 3**: External Services → Need database URLs from Phase 2
4. **Phase 4**: GitHub Secrets → Need tokens from Phase 3
5. **Phase 5**: Branch Protection → Need working workflows first
6. **Phase 6**: Local Testing → Validate before remote testing
7. **Phase 7**: Pipeline Testing → Test with real PR
8. **Phase 8**: Production Deploy → Only after PR testing works
9. **Phase 9**: Final Verification → Comprehensive checks

**❌ Common Mistakes to Avoid:**
- Setting up branch protection before external services are ready
- Configuring Vercel without database setup (builds will fail)
- Adding GitHub secrets before getting tokens from services
- Testing production deployment before PR workflows work
- **Expecting Vercel's first deployment to succeed** (it will fail - that's normal!)

**💡 Pro Tips:**
- Vercel forces you to deploy before configuring environment variables
- The first deployment will always fail - don't panic, just add env vars and redeploy
- Have your database URL ready before starting Vercel setup

## 🚀 Phase 1: Local Environment and Basic Setup

### Step 1.1: Local Environment Verification

1. **Verify local development setup**
   ```bash
   cd devpulse
   npm install
   npm run setup:ci-cd  # Run the setup assistant
   ```

2. **Test basic functionality**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

3. **Create local .env file**
   ```bash
   cp .env.example .env
   # Edit .env with your local development values
   ```

### Step 1.2: GitHub Repository Basic Setup

1. **Navigate to your GitHub repository**
2. **Go to Settings → Actions → General**
3. **Configure Actions permissions:**
   - Select "Allow all actions and reusable workflows"
   - Check "Allow actions created by GitHub"
   - Check "Allow actions by Marketplace verified creators"
4. **Workflow permissions:**
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
5. **Click "Save"**

**⚠️ Important:** Do NOT configure branch protection yet - we need external services first!

## 🗄️ Phase 2: Database and Infrastructure Setup

### Step 2.1: Production Database Setup

**You MUST set up the database before Vercel deployment, as the build process requires database access.**

1. **Choose a PostgreSQL provider:**
   - **Recommended:** [Supabase](https://supabase.com) (easiest setup)
   - **Alternative:** [PlanetScale](https://planetscale.com), [Neon](https://neon.tech)

2. **Create database instance**
   - Sign up for your chosen provider
   - Create a new database project
   - Get the connection string (DATABASE_URL)

3. **Test database connection locally**
   ```bash
   # Add DATABASE_URL to your .env file
   npm run db:generate
   npm run db:push
   ```

### Step 2.2: Redis Setup (Optional but Recommended)

1. **Choose a Redis provider:**
   - **Recommended:** [Upstash](https://upstash.com) (serverless, free tier)
   - **Alternative:** [Redis Cloud](https://redis.com/redis-enterprise-cloud/)

2. **Create Redis instance**
   - Sign up and create a database
   - Get the connection string (REDIS_URL)

## 🔐 Phase 3: External Service Setup

### Step 3.1: Vercel Setup

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - **Framework Preset:** Next.js
   - **Root Directory:** `devpulse`
   - **Build Command:** `npm run ci:build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm ci`

3. **⚠️ IMPORTANT: Handle Initial Deployment**
   - **Vercel will force you to click "Deploy" before you can configure environment variables**
   - **This first deployment WILL FAIL** - that's expected and OK!
   - Click "Deploy" to proceed (the build will fail due to missing DATABASE_URL)
   - **Don't worry about the failed deployment** - we'll fix it in the next step

4. **Configure Environment Variables (After Failed Deploy)**
   - After the failed deployment, go to Project Settings → Environment Variables
   - **⚠️ CRITICAL:** Use the DATABASE_URL from Phase 2 - this is why the first build failed!
   - Add all variables from `devpulse/.env.example`:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   GITHUB_ID=your-github-app-id
   GITHUB_SECRET=your-github-app-secret
   DATABASE_URL=your-production-database-url  # From Phase 2!
   REDIS_URL=your-production-redis-url        # From Phase 2!
   ENCRYPTION_KEY=your-32-character-encryption-key
   ```

5. **Trigger Successful Deployment**
   - After adding environment variables, go to Deployments tab
   - Click "Redeploy" on the failed deployment
   - **This deployment should now succeed** with the environment variables

6. **Get Vercel Tokens**
   - Go to Account Settings → Tokens
   - Create new token with name "DevPulse CI/CD"
   - Copy the token (save for GitHub secrets)
   - Go to Project Settings → General
   - Copy Project ID and Org ID (save for GitHub secrets)

### Step 3.2: SonarCloud Setup

1. **Create SonarCloud Account**
   - Go to [sonarcloud.io](https://sonarcloud.io)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "+" → "Analyze new project"
   - Select your GitHub repository
   - Choose "With GitHub Actions"

3. **Configure Project**
   - **Project Key:** `devpulse` (must match sonar-project.properties)
   - **Organization:** Your GitHub username or organization
   - **Main Branch:** `main`

4. **Get SonarCloud Token**
   - Go to My Account → Security
   - Generate new token with name "DevPulse CI/CD"
   - Copy the token (save for GitHub secrets)

5. **Configure Quality Gate**
   - Go to Project → Quality Gates
   - Set custom quality gate or use default
   - Configure coverage threshold (recommended: 80%)

### Step 3.3: Snyk Setup (Optional but Recommended)

1. **Create Snyk Account**
   - Go to [snyk.io](https://snyk.io)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "Add project"
   - Select GitHub and import your repository

3. **Get Snyk Token**
   - Go to Account Settings → API Token
   - Copy the token (save for GitHub secrets)

### Step 3.4: Lighthouse CI Setup (Optional)

1. **Create Lighthouse CI Account**
   - Go to [github.com/apps/lighthouse-ci](https://github.com/apps/lighthouse-ci)
   - Install the GitHub App on your repository

2. **Get LHCI Token**
   - Follow the setup wizard
   - Copy the token (save for GitHub secrets)

## 🔑 Phase 4: GitHub Secrets Configuration

### Step 4.1: Add Required Secrets

1. **Go to Repository Settings → Secrets and variables → Actions**
2. **Click "New repository secret" for each:**

**Required Secrets:**
```bash
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token_from_step_2.1
VERCEL_ORG_ID=your_vercel_org_id_from_step_2.1
VERCEL_PROJECT_ID=your_vercel_project_id_from_step_2.1

# SonarCloud Analysis
SONAR_TOKEN=your_sonar_token_from_step_2.2
```

**Optional Secrets:**
```bash
# Lighthouse CI (if configured)
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token_from_step_2.4

# Security Scanning (if using Snyk)
SNYK_TOKEN=your_snyk_token_from_step_2.3

# Notifications (if using Slack)
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### Step 4.2: Verify Secrets

1. **Check all secrets are added correctly**
2. **Ensure no typos in secret names**
3. **Verify tokens are valid and not expired**

## � Phhase 5: GitHub Branch Protection Setup

**⚠️ IMPORTANT: Only do this AFTER external services and secrets are configured!**

### Step 5.1: Configure Branch Protection Rules

1. **Go to Settings → Branches**
2. **Click "Add rule" for main branch**
3. **Configure protection settings:**
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - **Add required status checks (these must match workflow job names):**
     - `Code Quality`
     - `Unit & Integration Tests`
     - `Build Application`
     - `E2E Tests`
     - `Security Audit`
   - ✅ Restrict pushes that create files
4. **Click "Create"**

### Step 5.2: Verify Branch Protection

1. **Try to push directly to main** (should be blocked)
2. **Verify status checks are required**
3. **Test that workflows must pass before merging**

## 🧪 Phase 6: Local Testing and Validation

### Step 4.1: Production Database

1. **Choose a PostgreSQL provider:**
   - **Recommended:** Supabase, PlanetScale, or Neon
   - **Alternative:** Railway, Heroku Postgres, or AWS RDS

2. **Create database instance**
3. **Get connection string**
4. **Add to Vercel environment variables as `DATABASE_URL`**

### Step 4.2: Redis Setup

1. **Choose a Redis provider:**
   - **Recommended:** Upstash, Redis Cloud, or Railway
   - **Alternative:** Heroku Redis or AWS ElastiCache

2. **Create Redis instance**
3. **Get connection string**
4. **Add to Vercel environment variables as `REDIS_URL`**

### Step 6.1: Install Dependencies

```bash
cd devpulse
npm install
```

### Step 6.2: Run Validation Script

```bash
node scripts/validate-ci-setup.js
```

**Expected Output:**
```
🔍 Validating CI/CD Setup...

📁 Checking required files...
✅ All workflow files present

📦 Checking package.json scripts...
✅ All CI scripts configured

📚 Checking dev dependencies...
✅ All required dependencies installed

🧪 Testing CI scripts...
✅ Lint passed
✅ Type check passed
✅ Build passed

🔐 Checking environment setup...
✅ All environment variables documented

✅ CI/CD setup validation complete!
```

### Step 6.3: Test Local CI Commands

```bash
# Test individual CI steps
npm run lint
npm run type-check
npm run test:ci
npm run ci:build

# Test full CI flow
npm run ci:setup
npm run ci:test
```

## 🚀 Phase 7: Pipeline Testing

### Step 7.1: Create Test Pull Request

1. **Create a new branch:**
```bash
git checkout -b test/ci-pipeline
```

2. **Make a small change:**
```bash
echo "# CI/CD Pipeline Test" >> devpulse/docs/test-ci.md
git add .
git commit -m "test: verify CI/CD pipeline"
git push origin test/ci-pipeline
```

3. **Create Pull Request on GitHub**

### Step 7.2: Monitor Pipeline Execution

1. **Go to Actions tab in GitHub**
2. **Watch the CI/CD Pipeline workflow**
3. **Verify all jobs complete successfully:**
   - ✅ Code Quality
   - ✅ Unit & Integration Tests
   - ✅ Build Application
   - ✅ E2E Tests
   - ✅ Security Audit
   - ✅ Deploy Preview

### Step 7.3: Verify Preview Deployment

1. **Check PR comments for preview URL**
2. **Visit preview deployment**
3. **Verify application loads correctly**

## ✅ Phase 8: Production Deployment Test

### Step 8.1: Merge to Main

1. **Merge the test PR to main branch**
2. **Monitor production deployment workflow**
3. **Verify production deployment succeeds**

### Step 8.2: Verify Production Health

1. **Visit production URL**
2. **Check health endpoint: `https://your-app.vercel.app/api/health`**
3. **Verify monitoring workflow runs**

## 🔍 Phase 9: Comprehensive Verification

### Step 9.1: Verification Checklist

Run through this checklist to ensure everything is working:

#### GitHub Actions
- [ ] All workflows are visible in Actions tab
- [ ] No workflow syntax errors
- [ ] All required secrets are configured
- [ ] Branch protection rules are active

#### Code Quality
- [ ] ESLint runs and passes
- [ ] TypeScript checking works
- [ ] Prettier formatting is applied
- [ ] SonarCloud analysis completes

#### Testing
- [ ] Unit tests run and pass
- [ ] Integration tests work with database
- [ ] E2E tests execute across browsers
- [ ] Test coverage is reported

#### Security
- [ ] npm audit runs without high-severity issues
- [ ] Snyk scanning works (if configured)
- [ ] Dependency updates are automated

#### Deployment
- [ ] Preview deployments work for PRs
- [ ] Production deployments work for main
- [ ] Environment variables are set correctly
- [ ] Database connections work

#### Monitoring
- [ ] Health checks run every 15 minutes
- [ ] Performance monitoring works
- [ ] Alerts are configured properly

### Step 9.2: Performance Verification

```bash
# Test Lighthouse CI locally
cd devpulse
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.js
```

### Step 9.3: Security Verification

```bash
# Run security audit
npm run audit:security

# Check for vulnerabilities
npm audit --audit-level=moderate
```

## 🚨 Troubleshooting Common Issues

### Issue 1: Workflow Fails with Permission Errors

**Solution:**
1. Check GitHub Actions permissions in repository settings
2. Ensure "Read and write permissions" is selected
3. Verify secrets are correctly named and accessible

### Issue 2: Vercel Deployment Fails

**Solution:**
1. Check Vercel project configuration
2. Verify environment variables in Vercel dashboard
3. Check build logs for specific errors
4. Ensure build command and output directory are correct

### Issue 3: Database Connection Fails in CI

**Solution:**
1. Verify DATABASE_URL format
2. Check database provider allows connections from GitHub Actions IPs
3. Ensure database exists and is accessible
4. Test connection locally with same URL

### Issue 4: Tests Fail in CI but Pass Locally

**Solution:**
1. Check for environment-specific issues
2. Verify test database setup in CI
3. Check for timing issues in async tests
4. Ensure all test dependencies are installed

### Issue 5: SonarCloud Analysis Fails

**Solution:**
1. Verify SONAR_TOKEN is correct
2. Check project key matches sonar-project.properties
3. Ensure organization is correctly configured
4. Check SonarCloud project permissions

### Issue 6: Branch Protection Blocks Everything

**Symptoms:** Can't merge PRs, status checks never appear
**Solution:**
1. Temporarily disable branch protection
2. Ensure all external services are working
3. Test workflows with a PR first
4. Re-enable branch protection only after workflows pass

### Issue 7: Vercel Build Fails with Database Errors

**Symptoms:** Build fails with "DATABASE_URL not found" or connection errors
**Solution:**
1. **This is EXPECTED on first deployment** - Vercel forces you to deploy before configuring env vars
2. Ensure database was set up in Phase 2 BEFORE Vercel
3. After the failed deployment, add DATABASE_URL to Vercel environment variables
4. Redeploy the failed deployment - it should now succeed
5. Test database connection locally first
6. Check that database allows connections from Vercel IPs

### Issue 8: Can't Configure Environment Variables in Vercel

**Symptoms:** No way to add environment variables during import
**Solution:**
1. **This is normal Vercel behavior** - you must deploy first
2. Let the first deployment fail (expected)
3. Go to Project Settings → Environment Variables after the failed deploy
4. Add all required environment variables
5. Redeploy the failed deployment

### Issue 9: Workflows Don't Run

**Symptoms:** No workflows appear in Actions tab
**Solution:**
1. Check GitHub Actions are enabled (Phase 1)
2. Verify workflow files are in `.github/workflows/`
3. Ensure you've pushed the workflow files to the repository
4. Check workflow syntax with `yamllint` or GitHub's validator

## 📞 Getting Help

### Documentation Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

### Support Channels
1. **GitHub Issues:** Create issues in your repository
2. **Community Forums:** Stack Overflow, GitHub Discussions
3. **Provider Support:** Vercel, SonarCloud, Snyk support channels

### Emergency Procedures

#### Rollback Production Deployment
1. Go to Vercel dashboard
2. Find previous successful deployment
3. Click "Promote to Production"

#### Disable Failing Workflow
1. Go to Actions tab
2. Select failing workflow
3. Click "Disable workflow"
4. Fix issues and re-enable

## 🎉 Success Criteria

Your CI/CD pipeline is fully operational when:

- [ ] All GitHub Actions workflows run successfully
- [ ] Pull requests trigger preview deployments
- [ ] Main branch deployments go to production
- [ ] Code quality checks prevent bad code from merging
- [ ] Security scans identify vulnerabilities
- [ ] Performance monitoring tracks metrics
- [ ] Health monitoring alerts on issues
- [ ] Team can develop with confidence

## 📈 Next Steps

After successful setup:

1. **Team Training:** Train team members on the CI/CD workflow
2. **Documentation:** Keep this guide updated with any changes
3. **Monitoring:** Set up additional monitoring and alerting
4. **Optimization:** Continuously improve pipeline performance
5. **Security:** Regular security reviews and updates

## 📋 Quick Reference: Correct Setup Order

If you need to start over or help someone else, here's the exact order:

1. **✅ Local Environment** - Get the app running locally first
2. **✅ Database Setup** - PostgreSQL + Redis before anything else
3. **✅ Vercel Setup** - Import project with database URLs
4. **✅ SonarCloud Setup** - Code quality analysis
5. **✅ GitHub Secrets** - Add all tokens from services above
6. **✅ Branch Protection** - Only after secrets are configured
7. **✅ Test with PR** - Create test pull request
8. **✅ Production Deploy** - Merge to main after PR works
9. **✅ Final Verification** - Run all checks

**Remember:** Each step depends on the previous ones. Don't skip ahead!

Congratulations! Your DevPulse CI/CD pipeline is now fully operational! 🚀