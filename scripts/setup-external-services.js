#!/usr/bin/env node

/**
 * External Services Setup Assistant
 * 
 * This script guides you through setting up external services for DevPulse CI/CD:
 * - Vercel (deployment)
 * - SonarCloud (code quality)
 * - Database (PostgreSQL)
 * - Redis (caching)
 * - Optional: Snyk, Lighthouse CI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function step(message) {
  log(`\n📋 ${message}`, 'blue');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`💡 ${message}`, 'cyan');
}

// Check if we're in the right directory
function checkDirectory() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error('Please run this script from the devpulse directory');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.name !== 'devpulse') {
    error('This script must be run from the DevPulse project directory');
    process.exit(1);
  }
}

// Check prerequisites
function checkPrerequisites() {
  step('Checking prerequisites...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    error(`Node.js 18+ required. Current version: ${nodeVersion}`);
    process.exit(1);
  }
  success(`Node.js version: ${nodeVersion}`);
  
  // Check if git is configured
  try {
    const gitUser = execSync('git config user.name', { encoding: 'utf8' }).trim();
    const gitEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
    success(`Git configured: ${gitUser} <${gitEmail}>`);
  } catch (e) {
    error('Git is not configured. Please run: git config --global user.name "Your Name" && git config --global user.email "your@email.com"');
    process.exit(1);
  }
  
  // Check if we're in a git repository
  try {
    execSync('git status', { stdio: 'ignore' });
    success('Git repository detected');
  } catch (e) {
    error('Not in a git repository. Please initialize git first.');
    process.exit(1);
  }
  
  // Check if GitHub remote exists
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    if (remoteUrl.includes('github.com')) {
      success(`GitHub repository: ${remoteUrl}`);
    } else {
      warning('Remote origin is not a GitHub repository');
    }
  } catch (e) {
    warning('No GitHub remote configured');
  }
}

// Phase 2: Database Setup Guide
function databaseSetupGuide() {
  header('PHASE 2: DATABASE SETUP');
  
  log('\n🗄️  You need to set up a PostgreSQL database BEFORE Vercel deployment.', 'bright');
  log('The build process requires database access, so this must be done first.\n');
  
  log('📋 RECOMMENDED DATABASE PROVIDERS:', 'blue');
  log('1. Supabase (https://supabase.com) - Easiest setup, generous free tier');
  log('2. Neon (https://neon.tech) - Serverless PostgreSQL, good free tier');
  log('3. PlanetScale (https://planetscale.com) - MySQL alternative');
  log('4. Railway (https://railway.app) - Simple deployment platform');
  
  log('\n📋 SETUP STEPS:', 'blue');
  log('1. Sign up for your chosen provider');
  log('2. Create a new database project');
  log('3. Get the connection string (DATABASE_URL)');
  log('4. Test the connection locally');
  
  log('\n📋 REDIS SETUP (OPTIONAL BUT RECOMMENDED):', 'blue');
  log('1. Upstash (https://upstash.com) - Serverless Redis, free tier');
  log('2. Redis Cloud (https://redis.com) - Managed Redis service');
  log('3. Railway (https://railway.app) - Also provides Redis');
  
  log('\n💡 TESTING YOUR DATABASE:', 'cyan');
  log('After getting your DATABASE_URL:');
  log('1. Add it to your .env file');
  log('2. Run: npm run db:generate');
  log('3. Run: npm run db:push');
  log('4. If successful, you\'re ready for Vercel!');
  
  warning('\n⚠️  IMPORTANT: Save your DATABASE_URL - you\'ll need it for Vercel!');
}

// Phase 3: Vercel Setup Guide
function vercelSetupGuide() {
  header('PHASE 3: VERCEL SETUP');
  
  log('\n🚀 Vercel will be your deployment platform.', 'bright');
  log('⚠️  CRITICAL: The first deployment WILL FAIL - that\'s expected!\n');
  
  log('📋 VERCEL SETUP STEPS:', 'blue');
  log('1. Go to https://vercel.com');
  log('2. Sign up with your GitHub account');
  log('3. Click "New Project"');
  log('4. Import your GitHub repository');
  log('5. Configure project settings:');
  log('   - Framework Preset: Next.js');
  log('   - Root Directory: devpulse');
  log('   - Build Command: npm run ci:build');
  log('   - Output Directory: .next');
  log('   - Install Command: npm ci');
  
  warning('\n⚠️  EXPECTED FIRST DEPLOYMENT FAILURE:');
  log('- Vercel forces you to deploy before configuring environment variables');
  log('- The build will fail because DATABASE_URL is missing');
  log('- This is NORMAL and EXPECTED - don\'t panic!');
  log('- Just click "Deploy" and let it fail');
  
  log('\n📋 AFTER THE FAILED DEPLOYMENT:', 'blue');
  log('1. Go to Project Settings → Environment Variables');
  log('2. Add all required environment variables (see .env.example)');
  log('3. Go to Deployments tab');
  log('4. Click "Redeploy" on the failed deployment');
  log('5. This deployment should now succeed!');
  
  log('\n📋 REQUIRED ENVIRONMENT VARIABLES:', 'blue');
  log('- NODE_ENV=production');
  log('- NEXT_PUBLIC_APP_URL=https://your-app.vercel.app');
  log('- NEXTAUTH_URL=https://your-app.vercel.app');
  log('- NEXTAUTH_SECRET=your-production-secret');
  log('- GITHUB_ID=your-github-app-id');
  log('- GITHUB_SECRET=your-github-app-secret');
  log('- DATABASE_URL=your-production-database-url (from Phase 2!)');
  log('- REDIS_URL=your-production-redis-url (optional)');
  log('- ENCRYPTION_KEY=your-32-character-encryption-key');
  
  log('\n📋 GET VERCEL TOKENS FOR GITHUB:', 'blue');
  log('1. Go to Account Settings → Tokens');
  log('2. Create new token: "DevPulse CI/CD"');
  log('3. Copy the token (save for GitHub secrets)');
  log('4. Go to Project Settings → General');
  log('5. Copy Project ID and Org ID (save for GitHub secrets)');
  
  info('\n💡 TIP: Have your DATABASE_URL ready before starting!');
}

// Phase 3: SonarCloud Setup Guide
function sonarCloudSetupGuide() {
  header('PHASE 3: SONARCLOUD SETUP');
  
  log('\n🔍 SonarCloud provides code quality analysis.', 'bright');
  
  log('\n📋 SONARCLOUD SETUP STEPS:', 'blue');
  log('1. Go to https://sonarcloud.io');
  log('2. Sign up with your GitHub account');
  log('3. Click "+" → "Analyze new project"');
  log('4. Select your GitHub repository');
  log('5. Choose "With GitHub Actions"');
  
  log('\n📋 PROJECT CONFIGURATION:', 'blue');
  log('- Project Key: devpulse (must match sonar-project.properties)');
  log('- Organization: Your GitHub username or organization');
  log('- Main Branch: main');
  
  log('\n📋 GET SONARCLOUD TOKEN:', 'blue');
  log('1. Go to My Account → Security');
  log('2. Generate new token: "DevPulse CI/CD"');
  log('3. Copy the token (save for GitHub secrets)');
  
  log('\n📋 CONFIGURE QUALITY GATE:', 'blue');
  log('1. Go to Project → Quality Gates');
  log('2. Set custom quality gate or use default');
  log('3. Configure coverage threshold (recommended: 80%)');
  
  success('\n✅ SonarCloud will automatically analyze your code on every PR!');
}

// Optional services guide
function optionalServicesGuide() {
  header('OPTIONAL SERVICES');
  
  log('\n🔒 SNYK (Security Scanning)', 'bright');
  log('1. Go to https://snyk.io');
  log('2. Sign up with your GitHub account');
  log('3. Click "Add project" → Select GitHub → Import repository');
  log('4. Go to Account Settings → API Token');
  log('5. Copy token (save for GitHub secrets as SNYK_TOKEN)');
  
  log('\n🚦 LIGHTHOUSE CI (Performance Monitoring)', 'bright');
  log('1. Go to https://github.com/apps/lighthouse-ci');
  log('2. Install the GitHub App on your repository');
  log('3. Follow setup wizard');
  log('4. Copy token (save for GitHub secrets as LHCI_GITHUB_APP_TOKEN)');
  
  log('\n💬 SLACK NOTIFICATIONS (Optional)', 'bright');
  log('1. Create Slack webhook URL');
  log('2. Add as SLACK_WEBHOOK_URL in GitHub secrets');
  log('3. Workflows will send notifications on failures');
}

// GitHub secrets guide
function githubSecretsGuide() {
  header('PHASE 4: GITHUB SECRETS');
  
  log('\n🔑 Now you need to add all the tokens to GitHub secrets.', 'bright');
  
  log('\n📋 GITHUB SECRETS SETUP:', 'blue');
  log('1. Go to your GitHub repository');
  log('2. Settings → Secrets and variables → Actions');
  log('3. Click "New repository secret" for each token');
  
  log('\n📋 REQUIRED SECRETS:', 'blue');
  log('VERCEL_TOKEN=your_vercel_token');
  log('VERCEL_ORG_ID=your_vercel_org_id');
  log('VERCEL_PROJECT_ID=your_vercel_project_id');
  log('SONAR_TOKEN=your_sonar_token');
  
  log('\n📋 OPTIONAL SECRETS:', 'blue');
  log('SNYK_TOKEN=your_snyk_token');
  log('LHCI_GITHUB_APP_TOKEN=your_lighthouse_token');
  log('SLACK_WEBHOOK_URL=your_slack_webhook');
  
  warning('\n⚠️  IMPORTANT: Double-check secret names for typos!');
  warning('Secret names must match exactly what\'s in the workflow files.');
}

// Branch protection guide
function branchProtectionGuide() {
  header('PHASE 5: BRANCH PROTECTION');
  
  warning('\n⚠️  ONLY SET UP BRANCH PROTECTION AFTER ALL SERVICES ARE READY!');
  
  log('\n📋 BRANCH PROTECTION SETUP:', 'blue');
  log('1. Go to Settings → Branches');
  log('2. Click "Add rule" for main branch');
  log('3. Configure protection settings:');
  log('   - Branch name pattern: main');
  log('   - ✅ Require a pull request before merging');
  log('   - ✅ Require approvals (1)');
  log('   - ✅ Require status checks to pass before merging');
  log('   - ✅ Require branches to be up to date before merging');
  
  log('\n📋 REQUIRED STATUS CHECKS:', 'blue');
  log('Add these status checks (must match workflow job names):');
  log('- Code Quality');
  log('- Unit & Integration Tests');
  log('- Build Application');
  log('- E2E Tests');
  log('- Security Audit');
  
  error('\n❌ COMMON MISTAKE: Setting up branch protection too early!');
  log('If you set up branch protection before external services work,');
  log('you\'ll lock yourself out and won\'t be able to merge anything.');
}

// Testing guide
function testingGuide() {
  header('PHASE 6-7: TESTING');
  
  log('\n🧪 Test your setup with a pull request.', 'bright');
  
  log('\n📋 CREATE TEST PULL REQUEST:', 'blue');
  log('1. Create new branch: git checkout -b test/ci-pipeline');
  log('2. Make small change: echo "# Test" >> docs/test-ci.md');
  log('3. Commit: git add . && git commit -m "test: CI pipeline"');
  log('4. Push: git push origin test/ci-pipeline');
  log('5. Create PR on GitHub');
  
  log('\n📋 MONITOR PIPELINE:', 'blue');
  log('1. Go to Actions tab in GitHub');
  log('2. Watch CI/CD Pipeline workflow');
  log('3. Verify all jobs complete successfully');
  log('4. Check PR comments for preview URL');
  log('5. Visit preview deployment');
  
  log('\n📋 PRODUCTION DEPLOYMENT:', 'blue');
  log('1. Merge test PR to main');
  log('2. Monitor production deployment');
  log('3. Visit production URL');
  log('4. Check health endpoint: /api/health');
  
  success('\n✅ If everything works, your CI/CD pipeline is operational!');
}

// Main setup flow
function main() {
  header('DEVPULSE EXTERNAL SERVICES SETUP');
  
  log('This assistant will guide you through setting up external services', 'bright');
  log('for your DevPulse CI/CD pipeline.\n');
  
  warning('⚠️  IMPORTANT: Follow the phases in order - each depends on the previous!');
  
  checkDirectory();
  checkPrerequisites();
  
  // Phase 2: Database Setup
  databaseSetupGuide();
  
  // Phase 3: External Services
  vercelSetupGuide();
  sonarCloudSetupGuide();
  optionalServicesGuide();
  
  // Phase 4: GitHub Secrets
  githubSecretsGuide();
  
  // Phase 5: Branch Protection
  branchProtectionGuide();
  
  // Phase 6-7: Testing
  testingGuide();
  
  header('SETUP COMPLETE!');
  
  log('\n🎉 Follow the guides above to set up your external services.', 'green');
  log('📖 For detailed troubleshooting, see: docs/ci-cd-operational-guide.md', 'cyan');
  
  log('\n📋 QUICK CHECKLIST:', 'blue');
  log('□ Database (PostgreSQL) set up with connection string');
  log('□ Redis set up (optional)');
  log('□ Vercel project created and deployed');
  log('□ SonarCloud project configured');
  log('□ All GitHub secrets added');
  log('□ Branch protection configured (after services work)');
  log('□ Test PR created and merged successfully');
  
  log('\n🚀 Once complete, your CI/CD pipeline will be fully operational!', 'bright');
}

// Run the setup assistant
if (require.main === module) {
  main();
}

module.exports = {
  checkDirectory,
  checkPrerequisites,
  databaseSetupGuide,
  vercelSetupGuide,
  sonarCloudSetupGuide,
  githubSecretsGuide
};