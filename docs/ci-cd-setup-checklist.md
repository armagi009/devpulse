# CI/CD Setup Checklist

Use this checklist to ensure your DevPulse CI/CD pipeline is fully operational. Check off each item as you complete it.

## 🏁 Pre-Setup Verification

- [ ] Repository has admin access
- [ ] Local development environment is working
- [ ] Node.js 18+ is installed
- [ ] Git is configured with GitHub account
- [ ] Run `node scripts/verify-ci-operational.js` to check baseline setup

## 🐙 GitHub Configuration

### Repository Settings
- [ ] GitHub Actions are enabled in repository settings
- [ ] Workflow permissions set to "Read and write permissions"
- [ ] "Allow GitHub Actions to create and approve pull requests" is checked

### Branch Protection
- [ ] Branch protection rule created for `main` branch
- [ ] "Require a pull request before merging" enabled
- [ ] "Require status checks to pass before merging" enabled
- [ ] Required status checks added:
  - [ ] `Code Quality`
  - [ ] `Unit & Integration Tests`
  - [ ] `Build Application`
  - [ ] `E2E Tests`
  - [ ] `Security Audit`

## 🔐 External Services Setup

### Vercel (Required)
- [ ] Vercel account created and linked to GitHub
- [ ] Project imported with correct settings:
  - [ ] Framework: Next.js
  - [ ] Root Directory: `devpulse`
  - [ ] Build Command: `npm run ci:build`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `npm ci`
- [ ] Environment variables configured in Vercel dashboard
- [ ] Vercel tokens obtained:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`

### SonarCloud (Required)
- [ ] SonarCloud account created and linked to GitHub
- [ ] Project imported with "With GitHub Actions" option
- [ ] Project key set to `devpulse`
- [ ] Quality gate configured
- [ ] SonarCloud token obtained: `SONAR_TOKEN`

### Snyk (Optional but Recommended)
- [ ] Snyk account created and linked to GitHub
- [ ] Project imported for vulnerability scanning
- [ ] Snyk token obtained: `SNYK_TOKEN`

### Lighthouse CI (Optional)
- [ ] Lighthouse CI GitHub App installed
- [ ] LHCI token obtained: `LHCI_GITHUB_APP_TOKEN`

### Slack (Optional)
- [ ] Slack workspace webhook configured
- [ ] Webhook URL obtained: `SLACK_WEBHOOK_URL`

## 🗄️ Database and Infrastructure

### Production Database
- [ ] PostgreSQL database provider chosen (Supabase/PlanetScale/Neon)
- [ ] Database instance created
- [ ] Connection string obtained
- [ ] Database URL added to Vercel environment variables

### Redis (for background jobs)
- [ ] Redis provider chosen (Upstash/Redis Cloud/Railway)
- [ ] Redis instance created
- [ ] Connection string obtained
- [ ] Redis URL added to Vercel environment variables

## 🔑 GitHub Secrets Configuration

### Required Secrets
- [ ] `VERCEL_TOKEN` - Vercel deployment token
- [ ] `VERCEL_ORG_ID` - Vercel organization ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID
- [ ] `SONAR_TOKEN` - SonarCloud analysis token

### Optional Secrets
- [ ] `LHCI_GITHUB_APP_TOKEN` - Lighthouse CI token
- [ ] `SNYK_TOKEN` - Snyk security scanning token
- [ ] `SLACK_WEBHOOK_URL` - Slack notifications webhook

### Verification
- [ ] All secrets added without typos
- [ ] Secret names match exactly what's in workflows
- [ ] Tokens are valid and not expired

## 🧪 Local Testing

### Environment Setup
- [ ] `.env` file created from `.env.example`
- [ ] All required environment variables filled in
- [ ] Database connection working locally
- [ ] Application starts without errors: `npm run dev`

### CI Commands Testing
- [ ] Dependencies installed: `npm ci`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] Tests pass: `npm run test:ci`
- [ ] Build succeeds: `npm run ci:build`
- [ ] E2E tests work: `npm run test:e2e` (with app running)

### Validation Script
- [ ] Run `node scripts/verify-ci-operational.js`
- [ ] All checks pass or issues are addressed

## 🚀 Pipeline Testing

### First Pull Request Test
- [ ] Create test branch: `git checkout -b test/ci-pipeline`
- [ ] Make small change and commit
- [ ] Push branch: `git push origin test/ci-pipeline`
- [ ] Create pull request on GitHub
- [ ] Monitor Actions tab for workflow execution

### Workflow Verification
- [ ] "CI/CD Pipeline" workflow starts automatically
- [ ] All jobs complete successfully:
  - [ ] Code Quality ✅
  - [ ] Unit & Integration Tests ✅
  - [ ] Build Application ✅
  - [ ] E2E Tests ✅
  - [ ] Security Audit ✅
  - [ ] Deploy Preview ✅
- [ ] Preview deployment URL appears in PR comments
- [ ] Preview deployment is accessible and working

### Code Quality Checks
- [ ] "Code Quality Analysis" workflow runs
- [ ] SonarCloud analysis completes
- [ ] CodeQL analysis completes (if applicable)
- [ ] Bundle analysis runs
- [ ] Accessibility audit completes

## 🌐 Production Deployment

### Main Branch Deployment
- [ ] Merge test PR to main branch
- [ ] "CI/CD Pipeline" workflow runs for main branch
- [ ] Production deployment job executes
- [ ] Production URL is accessible
- [ ] Health endpoint works: `/api/health`

### Monitoring Setup
- [ ] "Production Monitoring" workflow is scheduled
- [ ] Health checks run every 15 minutes
- [ ] Performance monitoring is active
- [ ] Alerts are configured properly

## 🔍 Final Verification

### Comprehensive Testing
- [ ] Create another test PR with actual code changes
- [ ] Verify all quality gates work as expected
- [ ] Test that failing tests block PR merging
- [ ] Verify security scans catch vulnerabilities
- [ ] Confirm performance monitoring works

### Team Readiness
- [ ] Team members understand the CI/CD workflow
- [ ] Documentation is accessible and up-to-date
- [ ] Emergency procedures are documented
- [ ] Rollback procedures are tested

### Performance Verification
- [ ] Lighthouse scores meet thresholds
- [ ] Bundle size is within acceptable limits
- [ ] Core Web Vitals are good
- [ ] Performance budgets are configured

### Security Verification
- [ ] No high-severity vulnerabilities in dependencies
- [ ] Security audit passes
- [ ] Secrets are properly configured
- [ ] Access controls are in place

## 📊 Success Metrics

Your CI/CD pipeline is fully operational when:

- [ ] ✅ All GitHub Actions workflows run without errors
- [ ] ✅ Pull requests automatically trigger preview deployments
- [ ] ✅ Main branch changes deploy to production automatically
- [ ] ✅ Code quality checks prevent bad code from merging
- [ ] ✅ Security scans identify and report vulnerabilities
- [ ] ✅ Performance monitoring tracks key metrics
- [ ] ✅ Health monitoring alerts on production issues
- [ ] ✅ Team can develop with confidence in the pipeline

## 🚨 Troubleshooting Quick Reference

### Common Issues and Solutions

**Workflow fails with permission errors:**
- Check GitHub Actions permissions in repository settings
- Ensure "Read and write permissions" is selected

**Vercel deployment fails:**
- Verify environment variables in Vercel dashboard
- Check build command and output directory settings
- Review build logs for specific errors

**Tests fail in CI but pass locally:**
- Check environment variables in CI
- Verify database setup in CI environment
- Look for timing issues in async tests

**SonarCloud analysis fails:**
- Verify SONAR_TOKEN is correct and not expired
- Check project key matches sonar-project.properties
- Ensure organization permissions are correct

## 📞 Getting Help

If you encounter issues:

1. **Check the logs:** Review GitHub Actions workflow logs for specific errors
2. **Consult documentation:** Review `ci-cd-operational-guide.md` for detailed instructions
3. **Run diagnostics:** Use `node scripts/verify-ci-operational.js` to identify issues
4. **Check external services:** Verify Vercel, SonarCloud, and other service dashboards
5. **Create an issue:** Use GitHub issue templates to report problems

## 🎉 Completion

Once all items are checked off:

- [ ] **Final verification:** Run `node scripts/verify-ci-operational.js` one more time
- [ ] **Document any customizations:** Update documentation with any project-specific changes
- [ ] **Train the team:** Ensure all team members understand the workflow
- [ ] **Celebrate:** Your CI/CD pipeline is now fully operational! 🚀

---

**Date Completed:** _______________  
**Completed By:** _______________  
**Team Notified:** _______________