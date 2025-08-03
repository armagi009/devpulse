#!/usr/bin/env node

/**
 * External Services Verification Script
 * 
 * This script checks if external services are properly configured
 * and provides guidance on what's missing.
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

// Check if GitHub repository has required secrets
function checkGitHubSecrets() {
  log('\n🔑 Checking GitHub Secrets Configuration...', 'blue');
  
  const requiredSecrets = [
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID', 
    'VERCEL_PROJECT_ID',
    'SONAR_TOKEN'
  ];
  
  const optionalSecrets = [
    'SNYK_TOKEN',
    'LHCI_GITHUB_APP_TOKEN',
    'SLACK_WEBHOOK_URL'
  ];
  
  info('Required secrets (must be configured in GitHub):');
  requiredSecrets.forEach(secret => {
    log(`  - ${secret}`, 'yellow');
  });
  
  info('Optional secrets:');
  optionalSecrets.forEach(secret => {
    log(`  - ${secret}`, 'yellow');
  });
  
  warning('Cannot verify GitHub secrets from local environment');
  warning('Please check manually: Settings → Secrets and variables → Actions');
}

// Check if Vercel project exists and is configured
function checkVercelConfiguration() {
  log('\n🚀 Checking Vercel Configuration...', 'blue');
  
  try {
    // Check if vercel CLI is available
    execSync('which vercel', { stdio: 'ignore' });
    
    try {
      // Try to get project info
      const projectInfo = execSync('vercel project ls', { encoding: 'utf8', stdio: 'pipe' });
      if (projectInfo.includes('devpulse')) {
        success('Vercel project found');
      } else {
        warning('DevPulse project not found in Vercel');
      }
    } catch (e) {
      warning('Cannot access Vercel project info (may need to login)');
      info('Run: npx vercel login');
    }
  } catch (e) {
    warning('Vercel CLI not installed');
    info('Install with: npm i -g vercel');
  }
  
  // Check for vercel.json configuration
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  if (fs.existsSync(vercelConfigPath)) {
    success('vercel.json configuration found');
  } else {
    info('vercel.json not found (optional)');
  }
}

// Check SonarCloud configuration
function checkSonarCloudConfiguration() {
  log('\n🔍 Checking SonarCloud Configuration...', 'blue');
  
  const sonarPropertiesPath = path.join(process.cwd(), 'sonar-project.properties');
  if (fs.existsSync(sonarPropertiesPath)) {
    success('sonar-project.properties found');
    
    const content = fs.readFileSync(sonarPropertiesPath, 'utf8');
    if (content.includes('sonar.projectKey=devpulse')) {
      success('Project key correctly set to "devpulse"');
    } else {
      error('Project key should be "devpulse"');
    }
  } else {
    error('sonar-project.properties not found');
    info('This file should exist in the project root');
  }
}

// Check database configuration
function checkDatabaseConfiguration() {
  log('\n🗄️ Checking Database Configuration...', 'blue');
  
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('DATABASE_URL=')) {
      success('DATABASE_URL found in .env');
      
      // Try to test database connection
      try {
        execSync('npm run db:generate', { stdio: 'ignore' });
        success('Database schema generation works');
      } catch (e) {
        warning('Database schema generation failed');
        info('Check your DATABASE_URL format');
      }
    } else {
      warning('DATABASE_URL not found in .env');
      info('Add your database connection string to .env');
    }
    
    if (envContent.includes('REDIS_URL=')) {
      success('REDIS_URL found in .env (optional)');
    } else {
      info('REDIS_URL not found (optional)');
    }
  } else {
    warning('.env file not found');
    info('Copy .env.example to .env and configure your environment variables');
  }
}

// Check GitHub Actions workflows
function checkGitHubWorkflows() {
  log('\n⚙️ Checking GitHub Actions Workflows...', 'blue');
  
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
  if (fs.existsSync(workflowsDir)) {
    const workflows = fs.readdirSync(workflowsDir);
    
    const requiredWorkflows = [
      'ci.yml',
      'code-quality.yml',
      'dependency-updates.yml',
      'monitoring.yml',
      'release.yml'
    ];
    
    requiredWorkflows.forEach(workflow => {
      if (workflows.includes(workflow)) {
        success(`${workflow} workflow found`);
      } else {
        error(`${workflow} workflow missing`);
      }
    });
  } else {
    error('.github/workflows directory not found');
    info('GitHub Actions workflows are missing');
  }
}

// Check branch protection status
function checkBranchProtection() {
  log('\n🛡️ Checking Branch Protection...', 'blue');
  
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    if (remoteUrl.includes('github.com')) {
      const repoMatch = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (repoMatch) {
        const [, owner, repo] = repoMatch;
        warning('Cannot verify branch protection from local environment');
        info(`Check manually: https://github.com/${owner}/${repo}/settings/branches`);
      }
    }
  } catch (e) {
    warning('Cannot determine GitHub repository');
  }
}

// Main verification function
function main() {
  log('🔍 DevPulse External Services Verification', 'bright');
  log('=' .repeat(50), 'cyan');
  
  checkDatabaseConfiguration();
  checkVercelConfiguration();
  checkSonarCloudConfiguration();
  checkGitHubWorkflows();
  checkGitHubSecrets();
  checkBranchProtection();
  
  log('\n📋 Summary', 'bright');
  log('=' .repeat(50), 'cyan');
  
  log('\n✅ What you can verify locally:', 'green');
  log('- Database connection and schema');
  log('- GitHub Actions workflow files');
  log('- SonarCloud configuration files');
  log('- Environment variables in .env');
  
  log('\n⚠️  What you need to verify manually:', 'yellow');
  log('- GitHub secrets configuration');
  log('- Vercel project and environment variables');
  log('- SonarCloud project setup');
  log('- Branch protection rules');
  
  log('\n🚀 Next Steps:', 'blue');
  log('1. Fix any issues shown above');
  log('2. Verify external services manually');
  log('3. Create a test PR to validate the pipeline');
  log('4. Check: docs/external-services-checklist.md');
  
  log('\n💡 Need help? Run: npm run setup:external-services', 'cyan');
}

// Run verification
if (require.main === module) {
  main();
}

module.exports = {
  checkDatabaseConfiguration,
  checkVercelConfiguration,
  checkSonarCloudConfiguration,
  checkGitHubWorkflows
};