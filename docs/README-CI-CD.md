# DevPulse CI/CD Pipeline

A comprehensive CI/CD pipeline for the DevPulse application with automated testing, code quality checks, security scanning, and deployments.

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Run the setup assistant
npm run setup:ci-cd

# Verify your setup
npm run verify:ci-cd
```

### 2. Follow the Guides
- **📋 [Setup Checklist](ci-cd-setup-checklist.md)** - Step-by-step checklist
- **📖 [Operational Guide](ci-cd-operational-guide.md)** - Detailed setup instructions
- **🔧 [Technical Documentation](.github/README.md)** - Pipeline architecture and workflows

## 📁 Documentation Structure

```
devpulse/docs/
├── README-CI-CD.md                 # This file - overview and quick start
├── ci-cd-setup-checklist.md        # Step-by-step setup checklist
├── ci-cd-operational-guide.md      # Comprehensive setup guide
└── ci-cd-setup.md                  # Technical implementation details

.github/
├── README.md                       # Workflow documentation
├── workflows/                      # GitHub Actions workflows
│   ├── ci.yml                     # Main CI/CD pipeline
│   ├── code-quality.yml           # Code quality analysis
│   ├── dependency-updates.yml     # Automated dependency updates
│   ├── release.yml                # Release management
│   └── monitoring.yml             # Production monitoring
├── ISSUE_TEMPLATE/                # Issue templates
└── pull_request_template.md       # PR template

devpulse/scripts/
├── setup-ci-cd.js                 # Interactive setup assistant
├── verify-ci-operational.js       # Operational verification
└── validate-ci-setup.js           # Technical validation
```

## 🎯 Pipeline Overview

### Workflows

1. **CI/CD Pipeline** (`ci.yml`)
   - Runs on every push and PR
   - Code quality, testing, building, deployment
   - Preview deployments for PRs
   - Production deployment for main branch

2. **Code Quality Analysis** (`code-quality.yml`)
   - SonarCloud analysis
   - CodeQL security scanning
   - Bundle size analysis
   - Accessibility audits

3. **Dependency Updates** (`dependency-updates.yml`)
   - Weekly automated dependency updates
   - Security vulnerability scanning
   - Automated PR creation

4. **Release Management** (`release.yml`)
   - Automated release creation
   - Production deployment
   - Changelog generation

5. **Production Monitoring** (`monitoring.yml`)
   - Health checks every 15 minutes
   - Performance monitoring
   - Uptime tracking

### Key Features

- ✅ **Automated Testing** - Unit, integration, and E2E tests
- ✅ **Code Quality** - ESLint, TypeScript, Prettier, SonarCloud
- ✅ **Security** - Dependency audits, vulnerability scanning
- ✅ **Performance** - Lighthouse CI, bundle analysis
- ✅ **Deployments** - Preview and production deployments
- ✅ **Monitoring** - Health checks and performance tracking

## 🛠️ Available Commands

### Setup and Verification
```bash
npm run setup:ci-cd      # Interactive setup assistant
npm run verify:ci-cd     # Verify operational status
npm run validate:ci-cd   # Validate technical setup
```

### CI/CD Commands
```bash
npm run ci:setup         # Set up CI environment
npm run ci:test          # Run all CI tests
npm run ci:build         # Build for production
npm run ci:e2e           # Run E2E tests
```

### Development Commands
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript checking
npm run test:ci          # Run tests for CI
npm run audit:security   # Security audit
```

## 📋 Setup Process

### Phase 1: Initial Setup
1. Run `npm run setup:ci-cd` for guided setup
2. Create `.env` file from `.env.example`
3. Install dependencies and test basic commands

### Phase 2: External Services
1. **Vercel** - Deployment platform
2. **SonarCloud** - Code quality analysis
3. **Snyk** (optional) - Security scanning
4. **Database** - PostgreSQL for production
5. **Redis** - For background jobs

### Phase 3: GitHub Configuration
1. Enable GitHub Actions
2. Configure branch protection
3. Add required secrets
4. Set up status checks

### Phase 4: Testing and Verification
1. Create test pull request
2. Verify all workflows run
3. Test preview deployments
4. Confirm production deployment

## 🔐 Required Secrets

Add these to your GitHub repository secrets:

### Essential
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `SONAR_TOKEN` - SonarCloud analysis token

### Optional
- `SNYK_TOKEN` - Security scanning
- `LHCI_GITHUB_APP_TOKEN` - Lighthouse CI
- `SLACK_WEBHOOK_URL` - Notifications

## 🌐 Environment Variables

Configure these in Vercel and locally:

```bash
# Core Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret

# Authentication
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://user:pass@host:6379

# Security
ENCRYPTION_KEY=your-32-character-encryption-key

# Features
ENABLE_AI_FEATURES=false
ENABLE_TEAM_ANALYTICS=true
ENABLE_BACKGROUND_JOBS=true
```

## 🚨 Troubleshooting

### Common Issues

1. **Workflow Permission Errors**
   - Check GitHub Actions permissions
   - Ensure "Read and write permissions" is enabled

2. **Deployment Failures**
   - Verify Vercel configuration
   - Check environment variables
   - Review build logs

3. **Test Failures in CI**
   - Check database connection
   - Verify environment variables
   - Review test setup

4. **Security Audit Failures**
   - Update vulnerable dependencies
   - Review audit results
   - Consider security exceptions

### Getting Help

1. **Run Diagnostics**
   ```bash
   npm run verify:ci-cd
   ```

2. **Check Documentation**
   - [Operational Guide](ci-cd-operational-guide.md)
   - [Setup Checklist](ci-cd-setup-checklist.md)
   - [GitHub Actions Logs](https://github.com/your-repo/actions)

3. **Review External Services**
   - Vercel Dashboard
   - SonarCloud Project
   - GitHub Repository Settings

## 📊 Success Metrics

Your pipeline is operational when:

- ✅ All GitHub Actions workflows run without errors
- ✅ Pull requests trigger preview deployments
- ✅ Main branch changes deploy to production
- ✅ Code quality gates prevent bad code
- ✅ Security scans identify vulnerabilities
- ✅ Performance monitoring tracks metrics
- ✅ Health monitoring alerts on issues

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review dependency updates
- **Monthly**: Security audit review
- **Quarterly**: Pipeline optimization
- **As needed**: Documentation updates

### Monitoring
- GitHub Actions workflow status
- Vercel deployment health
- SonarCloud quality metrics
- Production application health

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## 🎉 Ready to Start?

1. **Begin with setup**: `npm run setup:ci-cd`
2. **Follow the checklist**: [ci-cd-setup-checklist.md](ci-cd-setup-checklist.md)
3. **Read the guide**: [ci-cd-operational-guide.md](ci-cd-operational-guide.md)
4. **Verify everything**: `npm run verify:ci-cd`

Your DevPulse CI/CD pipeline will be operational and ready to support your development workflow! 🚀