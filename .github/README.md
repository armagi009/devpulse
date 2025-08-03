# CI/CD Pipeline Documentation

This document describes the CI/CD pipeline setup for DevPulse.

## Overview

The CI/CD pipeline is built using GitHub Actions and includes:

- **Continuous Integration**: Automated testing, linting, and quality checks
- **Continuous Deployment**: Automated deployments to preview and production environments
- **Code Quality**: Static analysis, security scanning, and performance monitoring
- **Release Management**: Automated release creation and deployment

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull Requests

**Jobs**:
- **Code Quality**: ESLint, TypeScript checking, Tailwind verification
- **Unit & Integration Tests**: Jest tests with PostgreSQL and Redis
- **Build**: Application build with artifact upload
- **E2E Tests**: Playwright tests across multiple browsers
- **Security Audit**: npm audit and dependency scanning
- **Performance Tests**: Lighthouse CI for performance monitoring
- **Deploy Preview**: Vercel preview deployments for PRs
- **Deploy Production**: Production deployment on main branch

### 2. Code Quality Analysis (`code-quality.yml`)

**Triggers**: Push, Pull Requests, Weekly schedule

**Jobs**:
- **CodeQL Analysis**: GitHub's semantic code analysis
- **SonarCloud Analysis**: Code quality and security analysis
- **Bundle Analysis**: Next.js bundle size analysis
- **Accessibility Audit**: Automated accessibility testing

### 3. Dependency Updates (`dependency-updates.yml`)

**Triggers**: Weekly schedule, Manual dispatch

**Jobs**:
- **Update Dependencies**: Automated dependency updates with testing
- **Security Scan**: Snyk security vulnerability scanning

### 4. Release Management (`release.yml`)

**Triggers**: Git tags, Manual dispatch

**Jobs**:
- **Create Release**: GitHub release creation with changelog
- **Deploy Release**: Production deployment
- **Notify Release**: Slack notifications

### 5. Production Monitoring (`monitoring.yml`)

**Triggers**: Every 15 minutes, Manual dispatch

**Jobs**:
- **Health Check**: Production endpoint monitoring
- **Uptime Check**: Continuous uptime monitoring
- **Performance Monitoring**: Scheduled Lighthouse audits

## Setup Instructions

### 1. GitHub Secrets

Configure the following secrets in your GitHub repository:

```bash
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# SonarCloud
SONAR_TOKEN=your_sonar_token

# Lighthouse CI
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token

# Security Scanning
SNYK_TOKEN=your_snyk_token

# Notifications (Optional)
SLACK_WEBHOOK_URL=your_slack_webhook
```

### 2. Environment Variables

Ensure your `.env.example` includes all required variables:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/devpulse
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. External Services

#### Vercel Setup
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `cd devpulse && npm run ci:build`
   - Output Directory: `devpulse/.next`
   - Install Command: `cd devpulse && npm ci`

#### SonarCloud Setup
1. Import your project to SonarCloud
2. Configure quality gates
3. Set up project key in `sonar-project.properties`

#### Snyk Setup
1. Connect your repository to Snyk
2. Configure vulnerability thresholds
3. Set up automated PR creation for fixes

### 4. Branch Protection

Configure branch protection rules for `main`:

- Require pull request reviews
- Require status checks to pass:
  - `Code Quality`
  - `Unit & Integration Tests`
  - `Build Application`
  - `E2E Tests`
  - `Security Audit`
- Require branches to be up to date
- Restrict pushes to matching branches

## Local Development

### Running CI Checks Locally

```bash
# Install dependencies
npm run ci:setup

# Run all CI checks
npm run ci:test

# Run specific checks
npm run lint
npm run type-check
npm test
npm run build

# Run E2E tests
npm run ci:e2e
```

### Validating CI Setup

```bash
# Validate CI/CD configuration
node scripts/validate-ci-setup.js
```

## Monitoring and Alerts

### Health Monitoring
- Production health checks every 15 minutes
- API endpoint monitoring
- Performance threshold monitoring
- Automatic issue creation on failures

### Performance Monitoring
- Lighthouse CI on every PR
- Weekly performance audits
- Bundle size tracking
- Core Web Vitals monitoring

### Security Monitoring
- Daily dependency vulnerability scans
- Weekly security audits
- Automated security updates
- SARIF upload to GitHub Security tab

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify all dependencies are installed
   - Ensure database schema is up to date

2. **Test Failures**
   - Check test database connection
   - Verify mock data setup
   - Review test environment variables

3. **Deployment Failures**
   - Verify Vercel configuration
   - Check environment variables
   - Review build logs

4. **Performance Issues**
   - Review Lighthouse reports
   - Check bundle analysis
   - Monitor Core Web Vitals

### Getting Help

1. Check workflow logs in GitHub Actions
2. Review error messages and stack traces
3. Consult the troubleshooting guides
4. Create an issue with detailed information

## Best Practices

### Code Quality
- Write comprehensive tests
- Follow ESLint and Prettier rules
- Maintain high code coverage
- Use TypeScript strictly

### Security
- Keep dependencies updated
- Review security audit results
- Follow secure coding practices
- Monitor vulnerability reports

### Performance
- Optimize bundle size
- Monitor Core Web Vitals
- Use performance budgets
- Regular performance audits

### Deployment
- Use feature flags for risky changes
- Test thoroughly in preview environments
- Monitor deployment health
- Have rollback procedures ready