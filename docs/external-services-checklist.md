# External Services Setup Checklist

This checklist ensures you set up all external services in the correct order for DevPulse CI/CD.

## 🚨 CRITICAL: Setup Order

**⚠️ FOLLOW THIS EXACT ORDER - Each phase depends on the previous ones!**

1. ✅ **Phase 1**: Local Environment (COMPLETED)
2. 🔄 **Phase 2**: Database/Infrastructure Setup
3. 🔄 **Phase 3**: External Services Setup
4. 🔄 **Phase 4**: GitHub Secrets Configuration
5. 🔄 **Phase 5**: Branch Protection Rules
6. 🔄 **Phase 6**: Testing & Validation

---

## 📋 Phase 2: Database & Infrastructure Setup

### PostgreSQL Database Setup
- [ ] **Choose provider**: Supabase, Neon, PlanetScale, or Railway
- [ ] **Create account** and sign up
- [ ] **Create new database project**
- [ ] **Get connection string** (DATABASE_URL)
- [ ] **Test locally**:
  ```bash
  # Add DATABASE_URL to .env file
  npm run db:generate
  npm run db:push
  ```
- [ ] **Save DATABASE_URL** for Vercel setup

**Recommended: Supabase**
- URL: https://supabase.com
- Free tier: 500MB database, 2GB bandwidth
- Easy setup with GitHub integration

### Redis Setup (Optional but Recommended)
- [ ] **Choose provider**: Upstash, Redis Cloud, or Railway
- [ ] **Create Redis instance**
- [ ] **Get connection string** (REDIS_URL)
- [ ] **Save REDIS_URL** for Vercel setup

**Recommended: Upstash**
- URL: https://upstash.com
- Serverless Redis with generous free tier

---

## 📋 Phase 3: External Services Setup

### 🚀 Vercel Setup (Deployment Platform)

**Account Setup:**
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub account
- [ ] Verify email address

**Project Import:**
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Configure project settings:
  - [ ] Framework Preset: **Next.js**
  - [ ] Root Directory: **devpulse**
  - [ ] Build Command: **npm run ci:build**
  - [ ] Output Directory: **.next**
  - [ ] Install Command: **npm ci**

**⚠️ Expected First Deployment (WILL FAIL):**
- [ ] Click "Deploy" (Vercel forces this before env vars)
- [ ] **Let it fail** - this is expected and normal!
- [ ] Don't panic when build fails with DATABASE_URL error

**Environment Variables (After Failed Deploy):**
- [ ] Go to Project Settings → Environment Variables
- [ ] Add all required variables:
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`
  - [ ] `NEXTAUTH_URL=https://your-app.vercel.app`
  - [ ] `NEXTAUTH_SECRET=your-production-secret`
  - [ ] `GITHUB_ID=your-github-app-id`
  - [ ] `GITHUB_SECRET=your-github-app-secret`
  - [ ] `DATABASE_URL=your-production-database-url` ⚠️ **From Phase 2!**
  - [ ] `REDIS_URL=your-production-redis-url` (optional)
  - [ ] `ENCRYPTION_KEY=your-32-character-encryption-key`

**Successful Deployment:**
- [ ] Go to Deployments tab
- [ ] Click "Redeploy" on the failed deployment
- [ ] Verify deployment succeeds with environment variables

**Get Vercel Tokens:**
- [ ] Go to Account Settings → Tokens
- [ ] Create token: "DevPulse CI/CD"
- [ ] **Save token** for GitHub secrets
- [ ] Go to Project Settings → General
- [ ] **Copy Project ID** for GitHub secrets
- [ ] **Copy Org ID** for GitHub secrets

### 🔍 SonarCloud Setup (Code Quality)

**Account Setup:**
- [ ] Go to https://sonarcloud.io
- [ ] Sign up with GitHub account

**Project Import:**
- [ ] Click "+" → "Analyze new project"
- [ ] Select your GitHub repository
- [ ] Choose "With GitHub Actions"

**Project Configuration:**
- [ ] Project Key: **devpulse** (must match sonar-project.properties)
- [ ] Organization: Your GitHub username/organization
- [ ] Main Branch: **main**

**Get SonarCloud Token:**
- [ ] Go to My Account → Security
- [ ] Generate token: "DevPulse CI/CD"
- [ ] **Save token** for GitHub secrets

**Quality Gate Configuration:**
- [ ] Go to Project → Quality Gates
- [ ] Set custom quality gate or use default
- [ ] Configure coverage threshold (recommended: 80%)

### 🔒 Snyk Setup (Security Scanning) - Optional

**Account Setup:**
- [ ] Go to https://snyk.io
- [ ] Sign up with GitHub account

**Project Import:**
- [ ] Click "Add project"
- [ ] Select GitHub → Import repository

**Get Snyk Token:**
- [ ] Go to Account Settings → API Token
- [ ] **Save token** for GitHub secrets

### 🚦 Lighthouse CI Setup (Performance) - Optional

**GitHub App Installation:**
- [ ] Go to https://github.com/apps/lighthouse-ci
- [ ] Install GitHub App on your repository

**Get LHCI Token:**
- [ ] Follow setup wizard
- [ ] **Save token** for GitHub secrets

---

## 📋 Phase 4: GitHub Secrets Configuration

**Navigate to Secrets:**
- [ ] Go to your GitHub repository
- [ ] Settings → Secrets and variables → Actions
- [ ] Click "New repository secret"

**Required Secrets:**
- [ ] `VERCEL_TOKEN` = your_vercel_token_from_phase_3
- [ ] `VERCEL_ORG_ID` = your_vercel_org_id_from_phase_3
- [ ] `VERCEL_PROJECT_ID` = your_vercel_project_id_from_phase_3
- [ ] `SONAR_TOKEN` = your_sonar_token_from_phase_3

**Optional Secrets:**
- [ ] `SNYK_TOKEN` = your_snyk_token (if using Snyk)
- [ ] `LHCI_GITHUB_APP_TOKEN` = your_lighthouse_token (if using Lighthouse)
- [ ] `SLACK_WEBHOOK_URL` = your_slack_webhook (if using Slack notifications)

**Verification:**
- [ ] Double-check all secret names for typos
- [ ] Ensure tokens are valid and not expired
- [ ] Verify all required secrets are present

---

## 📋 Phase 5: Branch Protection Rules

**⚠️ CRITICAL: Only set up AFTER all external services and secrets are configured!**

**Navigate to Branch Protection:**
- [ ] Go to Settings → Branches
- [ ] Click "Add rule" for main branch

**Protection Settings:**
- [ ] Branch name pattern: **main**
- [ ] ✅ Require a pull request before merging
- [ ] ✅ Require approvals (1)
- [ ] ✅ Require status checks to pass before merging
- [ ] ✅ Require branches to be up to date before merging

**Required Status Checks (must match workflow job names):**
- [ ] `Code Quality`
- [ ] `Unit & Integration Tests`
- [ ] `Build Application`
- [ ] `E2E Tests`
- [ ] `Security Audit`

**Additional Settings:**
- [ ] ✅ Restrict pushes that create files
- [ ] Click "Create" to save rules

**Verification:**
- [ ] Try pushing directly to main (should be blocked)
- [ ] Verify status checks are required
- [ ] Confirm workflows must pass before merging

---

## 📋 Phase 6: Testing & Validation

### Create Test Pull Request
- [ ] Create test branch: `git checkout -b test/ci-pipeline`
- [ ] Make small change: `echo "# CI Test" >> docs/test-ci.md`
- [ ] Commit changes: `git add . && git commit -m "test: verify CI/CD pipeline"`
- [ ] Push branch: `git push origin test/ci-pipeline`
- [ ] Create Pull Request on GitHub

### Monitor Pipeline Execution
- [ ] Go to Actions tab in GitHub
- [ ] Watch CI/CD Pipeline workflow
- [ ] Verify all jobs complete successfully:
  - [ ] ✅ Code Quality
  - [ ] ✅ Unit & Integration Tests
  - [ ] ✅ Build Application
  - [ ] ✅ E2E Tests
  - [ ] ✅ Security Audit
  - [ ] ✅ Deploy Preview

### Verify Preview Deployment
- [ ] Check PR comments for preview URL
- [ ] Visit preview deployment
- [ ] Verify application loads correctly
- [ ] Test basic functionality

### Production Deployment Test
- [ ] Merge test PR to main branch
- [ ] Monitor production deployment workflow
- [ ] Verify production deployment succeeds
- [ ] Visit production URL
- [ ] Check health endpoint: `/api/health`
- [ ] Verify monitoring workflow runs

---

## 🎯 Success Criteria

Your external services setup is complete when:

- [ ] **Database**: PostgreSQL accessible with valid connection string
- [ ] **Vercel**: Project deployed successfully with all environment variables
- [ ] **SonarCloud**: Code analysis runs on every PR
- [ ] **GitHub Secrets**: All required tokens configured correctly
- [ ] **Branch Protection**: Rules prevent direct pushes to main
- [ ] **CI/CD Pipeline**: All workflows run successfully on test PR
- [ ] **Preview Deployments**: PRs generate working preview URLs
- [ ] **Production Deployments**: Main branch deploys to production
- [ ] **Health Monitoring**: Application health checks pass

---

## 🚨 Common Issues & Solutions

### Issue: Vercel Build Fails with Database Error
**Symptoms:** Build fails with "DATABASE_URL not found"
**Solution:** 
- This is expected on first deployment
- Add DATABASE_URL to Vercel environment variables
- Redeploy the failed deployment

### Issue: SonarCloud Analysis Doesn't Run
**Symptoms:** No SonarCloud status check appears
**Solution:**
- Verify SONAR_TOKEN is correct in GitHub secrets
- Check project key matches sonar-project.properties
- Ensure organization is correctly configured

### Issue: Branch Protection Blocks Everything
**Symptoms:** Can't merge PRs, status checks never appear
**Solution:**
- Temporarily disable branch protection
- Ensure all external services work first
- Test with a PR before re-enabling protection

### Issue: GitHub Actions Don't Run
**Symptoms:** No workflows appear in Actions tab
**Solution:**
- Check GitHub Actions are enabled in repository settings
- Verify workflow files are in `.github/workflows/`
- Ensure you've pushed workflow files to repository

---

## 📞 Getting Help

### Quick Setup Assistant
```bash
cd devpulse
node scripts/setup-external-services.js
```

### Documentation
- [CI/CD Operational Guide](./ci-cd-operational-guide.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)

### Emergency Procedures
- **Rollback Deployment**: Use Vercel dashboard to promote previous deployment
- **Disable Workflow**: Go to Actions tab → Select workflow → Disable
- **Remove Branch Protection**: Settings → Branches → Delete rule

---

## 🎉 Next Steps

After completing this checklist:

1. **Team Training**: Share this checklist with team members
2. **Documentation**: Keep guides updated with any changes
3. **Monitoring**: Set up additional alerts and monitoring
4. **Optimization**: Continuously improve pipeline performance
5. **Security**: Regular security reviews and token rotation

**🚀 Congratulations! Your DevPulse CI/CD pipeline with external services is now fully operational!**