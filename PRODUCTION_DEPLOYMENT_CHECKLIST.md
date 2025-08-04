# 🚀 Production Deployment Checklist

## **Current Status: Ready for External Services Setup**

✅ **COMPLETED:**
- Local development environment working
- Comprehensive CI/CD workflows configured (temporarily disabled)
- Vercel initial deployment complete
- Production environment template created
- Supabase project URL and anon key obtained

🔄 **IN PROGRESS:**
- External services integration
- Environment variables configuration
- GitHub secrets setup

---

## **Phase 1: Complete Supabase Configuration** 🗄️

### **Step 1.1: Get Missing Supabase Credentials**

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu

2. **Get Database Connection String:**
   - Navigate to: **Settings → Database**
   - Under "Connection parameters", copy the **Connection string**
   - It should look like: `postgresql://postgres:[YOUR_PASSWORD]@db.yyxisciydoxchggzgcbu.supabase.co:5432/postgres`
   - **Note:** Replace `[YOUR_PASSWORD]` with your actual database password

3. **Get Service Role Key:**
   - Navigate to: **Settings → API**
   - Copy the **service_role** key (NOT the anon key)
   - This key has admin privileges - keep it secure!

### **Step 1.2: Update Production Environment**

Update the `.env.production` file with the actual values:

```bash
# Replace these placeholders:
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.yyxisciydoxchggzgcbu.supabase.co:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_from_supabase
```

### **Step 1.3: Test Database Connection Locally**

```bash
cd devpulse
# Copy production DATABASE_URL to local .env for testing
npm run db:generate
npm run db:push
```

If successful, your database is ready for production!

---

## **Phase 2: Configure Vercel Environment** 🚀

### **Step 2.1: Add Environment Variables to Vercel**

1. **Go to your Vercel project dashboard**
2. **Navigate to: Settings → Environment Variables**
3. **Add ALL variables from `.env.production`:**

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
NEXTAUTH_URL=https://your-actual-vercel-url.vercel.app
NEXTAUTH_SECRET=Doi5yJZsxDQOJuWRC+O8kO6kp1fia5HUTfxhoqC8jEc=
GITHUB_ID=Ov23lipsOJ2q1BRwFDJD
GITHUB_SECRET=944daa0bfbc02c7276660265f9a4546eaaf40462
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.yyxisciydoxchggzgcbu.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://yyxisciydoxchggzgcbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5eGlzY2l5ZG94Y2hnZ3pnY2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjk1NzcsImV4cCI6MjA2OTgwNTU3N30.2J0TN7Y7VPVUrnTbpKEMqSFpXgfq_97DZCGDTRxSDiA
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
ENCRYPTION_KEY=ae9dce6a416bb669f9cb6ed6cd5513b78ffe6f65704cdb985bca7d2ca3a6d11c
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR=false
NEXT_PUBLIC_LOG_MOCK_CALLS=false
NEXT_PUBLIC_ENABLE_MOCK_API=false
ENABLE_AI_FEATURES=false
ENABLE_TEAM_ANALYTICS=true
ENABLE_BACKGROUND_JOBS=true
LHCI_GITHUB_APP_TOKEN=KIaccQCPyvm1Suq:78535448:LPchm7MWZ
```

### **Step 2.2: Update GitHub OAuth App**

1. **Go to GitHub → Settings → Developer settings → OAuth Apps**
2. **Update your OAuth app with your Vercel URL:**
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`

### **Step 2.3: Trigger Successful Deployment**

1. **Go to Vercel Deployments tab**
2. **Click "Redeploy" on the latest deployment**
3. **Monitor build logs for success**

---

## **Phase 3: Set Up External Services** 🔍

### **Step 3.1: SonarCloud Setup**

1. **Create Account:**
   - Go to: https://sonarcloud.io
   - Sign up with your GitHub account

2. **Import Project:**
   - Click "+" → "Analyze new project"
   - Select your GitHub repository: `armagi009/devpulse`
   - Choose "With GitHub Actions"

3. **Configure Project:**
   - Project Key: `devpulse` (must match sonar-project.properties)
   - Organization: `armagi009`
   - Main Branch: `main`

4. **Get Token:**
   - Go to: My Account → Security
   - Generate token: "DevPulse CI/CD"
   - **Save this token** for GitHub secrets

### **Step 3.2: Snyk Setup (Optional)**

1. **Create Account:**
   - Go to: https://snyk.io
   - Sign up with your GitHub account

2. **Import Project:**
   - Click "Add project" → GitHub → Import repository

3. **Get Token:**
   - Go to: Account Settings → API Token
   - **Save this token** for GitHub secrets

### **Step 3.3: Get Vercel Tokens**

1. **Get Vercel Token:**
   - Go to: Vercel Account Settings → Tokens
   - Create token: "DevPulse CI/CD"
   - **Save this token**

2. **Get Project IDs:**
   - Go to: Project Settings → General
   - Copy **Project ID** and **Org ID**
   - **Save these values**

---

## **Phase 4: Configure GitHub Secrets** 🔑

### **Step 4.1: Add Required Secrets**

Go to: https://github.com/armagi009/devpulse/settings/secrets/actions

**Add these secrets:**

```bash
VERCEL_TOKEN=your_vercel_token_from_step_3.3
VERCEL_ORG_ID=your_vercel_org_id_from_step_3.3
VERCEL_PROJECT_ID=your_vercel_project_id_from_step_3.3
SONAR_TOKEN=your_sonar_token_from_step_3.1
```

**Optional secrets:**
```bash
SNYK_TOKEN=your_snyk_token_from_step_3.2
SLACK_WEBHOOK_URL=your_slack_webhook_if_using_slack
```

### **Step 4.2: Verify Secrets**

- Double-check all secret names for typos
- Ensure tokens are valid and not expired
- Verify all required secrets are present

---

## **Phase 5: Enable CI/CD Pipeline** ⚡

### **Step 5.1: Enable Workflow Triggers**

Update `.github/workflows/ci.yml` to enable triggers:

```yaml
# Replace the commented triggers with:
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch:
```

### **Step 5.2: Commit and Push Changes**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: enable CI/CD pipeline triggers"
git push origin main
```

---

## **Phase 6: Test with Pull Request** 🧪

### **Step 6.1: Create Test Branch**

```bash
git checkout -b test/production-deployment
echo "# Production Deployment Test" >> docs/production-test.md
git add docs/production-test.md
git commit -m "test: verify production deployment pipeline"
git push origin test/production-deployment
```

### **Step 6.2: Create Pull Request**

1. **Go to GitHub and create PR**
2. **Monitor Actions tab for workflow execution**
3. **Verify all jobs complete successfully:**
   - ✅ Code Quality
   - ✅ Unit & Integration Tests
   - ✅ Build Application
   - ✅ E2E Tests
   - ✅ Security Audit
   - ✅ Deploy Preview

### **Step 6.3: Verify Preview Deployment**

1. **Check PR comments for preview URL**
2. **Visit preview deployment**
3. **Test basic functionality**
4. **Verify authentication works**

---

## **Phase 7: Production Deployment** 🎯

### **Step 7.1: Merge to Main**

1. **Merge the test PR to main branch**
2. **Monitor production deployment workflow**
3. **Verify production deployment succeeds**

### **Step 7.2: Verify Production**

1. **Visit production URL**
2. **Test authentication flow**
3. **Check health endpoint: `/api/health`**
4. **Verify all features work correctly**

---

## **Phase 8: Set Up Branch Protection** 🛡️

### **Step 8.1: Configure Branch Protection Rules**

**⚠️ ONLY after all services work!**

1. **Go to: Settings → Branches**
2. **Click "Add rule" for main branch**
3. **Configure:**
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

4. **Add required status checks:**
   - `Code Quality`
   - `Unit & Integration Tests`
   - `Build Application`
   - `E2E Tests`
   - `Security Audit`

---

## **Verification Commands** 🔍

Run these commands to verify your setup at each phase:

```bash
# Verify external services configuration
node scripts/verify-external-services.js

# Test database connection
npm run db:generate && npm run db:push

# Test local build
npm run ci:build

# Run all tests
npm run test:ci
```

---

## **Success Criteria** ✅

Your production deployment is complete when:

- [ ] Supabase database connection works
- [ ] Vercel deployment succeeds with all environment variables
- [ ] SonarCloud analyzes code on every PR
- [ ] All GitHub secrets are configured correctly
- [ ] CI/CD pipeline runs successfully on test PR
- [ ] Preview deployments work for PRs
- [ ] Production deployments work for main branch
- [ ] Branch protection prevents direct pushes to main
- [ ] Application works correctly in production
- [ ] Authentication flow works with GitHub OAuth

---

## **Emergency Procedures** 🚨

### **Rollback Production Deployment**
1. Go to Vercel dashboard
2. Find previous successful deployment
3. Click "Promote to Production"

### **Disable Failing Workflow**
1. Go to Actions tab
2. Select failing workflow
3. Click "Disable workflow"

### **Remove Branch Protection**
1. Go to Settings → Branches
2. Click on protection rule
3. Click "Delete rule"

---

## **Next Steps After Completion** 🚀

1. **Team Training:** Share this checklist with team members
2. **Documentation:** Keep guides updated
3. **Monitoring:** Set up additional alerts
4. **Security:** Regular token rotation
5. **Performance:** Monitor and optimize

---

**🎉 Once you complete all phases, your DevPulse application will be fully deployed to production with a complete CI/CD pipeline!**