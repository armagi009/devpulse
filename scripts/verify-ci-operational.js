#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

console.log('🔍 Verifying CI/CD Pipeline Operational Status...\n');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve(response.statusCode);
    });
    
    request.on('error', () => {
      resolve(null);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(null);
    });
  });
}

async function main() {
  let allChecks = true;

  // 1. Check GitHub Actions workflows
  log('blue', '📁 Checking GitHub Actions workflows...');
  const workflowFiles = [
    '../../.github/workflows/ci.yml',
    '../../.github/workflows/code-quality.yml',
    '../../.github/workflows/dependency-updates.yml',
    '../../.github/workflows/release.yml',
    '../../.github/workflows/monitoring.yml',
  ];

  workflowFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log('green', `✅ ${path.basename(file)}`);
    } else {
      log('red', `❌ ${path.basename(file)}`);
      allChecks = false;
    }
  });

  // 2. Check package.json CI scripts
  log('blue', '\n📦 Checking CI scripts...');
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  
  const requiredScripts = [
    'ci:setup',
    'ci:test', 
    'ci:build',
    'ci:e2e',
    'lint',
    'type-check',
    'test:ci'
  ];

  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      log('green', `✅ ${script}`);
    } else {
      log('red', `❌ ${script}`);
      allChecks = false;
    }
  });

  // 3. Test local CI commands
  log('blue', '\n🧪 Testing local CI commands...');
  
  const testCommands = [
    { name: 'Lint', command: 'npm run lint' },
    { name: 'Type Check', command: 'npm run type-check' },
    { name: 'Build', command: 'npm run ci:build' }
  ];

  for (const test of testCommands) {
    try {
      execSync(test.command, { stdio: 'pipe', cwd: path.join(__dirname, '..') });
      log('green', `✅ ${test.name} passed`);
    } catch (error) {
      log('red', `❌ ${test.name} failed`);
      allChecks = false;
    }
  }

  // 4. Check environment configuration
  log('blue', '\n🔐 Checking environment configuration...');
  
  const envExample = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf8');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GITHUB_ID',
    'GITHUB_SECRET'
  ];

  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      log('green', `✅ ${envVar} documented`);
    } else {
      log('red', `❌ ${envVar} missing`);
      allChecks = false;
    }
  });

  // 5. Check if .env file exists locally
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    log('green', '✅ Local .env file exists');
  } else {
    log('yellow', '⚠️  Local .env file missing (create from .env.example)');
  }

  // 6. Check GitHub repository configuration
  log('blue', '\n🐙 Checking GitHub configuration...');
  
  try {
    const gitRemote = execSync('git remote get-url origin', { 
      stdio: 'pipe', 
      cwd: path.join(__dirname, '..') 
    }).toString().trim();
    
    if (gitRemote.includes('github.com')) {
      log('green', '✅ GitHub repository configured');
      
      // Extract repo info
      const repoMatch = gitRemote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (repoMatch) {
        const [, owner, repo] = repoMatch;
        log('blue', `   Repository: ${owner}/${repo}`);
      }
    } else {
      log('red', '❌ Not a GitHub repository');
      allChecks = false;
    }
  } catch (error) {
    log('red', '❌ Git repository not configured');
    allChecks = false;
  }

  // 7. Check for common deployment URLs
  log('blue', '\n🌐 Checking deployment configuration...');
  
  const packageJsonContent = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
  if (packageJsonContent.includes('vercel')) {
    log('green', '✅ Vercel deployment configured');
  } else {
    log('yellow', '⚠️  Vercel deployment not detected');
  }

  // 8. Test health endpoint if available
  log('blue', '\n🏥 Testing health endpoint...');
  
  const healthUrls = [
    'http://localhost:3000/api/health',
    'https://devpulse.vercel.app/api/health'
  ];

  for (const url of healthUrls) {
    try {
      const status = await checkUrl(url);
      if (status === 200) {
        log('green', `✅ Health endpoint accessible: ${url}`);
        break;
      } else if (status) {
        log('yellow', `⚠️  Health endpoint returned ${status}: ${url}`);
      } else {
        log('yellow', `⚠️  Health endpoint not accessible: ${url}`);
      }
    } catch (error) {
      log('yellow', `⚠️  Could not check: ${url}`);
    }
  }

  // 9. Summary and recommendations
  log('blue', '\n📋 Summary and Recommendations...');
  
  if (allChecks) {
    log('green', '🎉 All critical checks passed! Your CI/CD pipeline is ready.');
    log('blue', '\n📋 Next steps:');
    log('blue', '1. Configure GitHub secrets (see ci-cd-operational-guide.md)');
    log('blue', '2. Set up external services (Vercel, SonarCloud, etc.)');
    log('blue', '3. Test with a pull request');
    log('blue', '4. Monitor first deployment');
  } else {
    log('red', '❌ Some checks failed. Please address the issues above.');
    log('blue', '\n📋 Recommended actions:');
    log('blue', '1. Fix failing local tests');
    log('blue', '2. Ensure all required files are present');
    log('blue', '3. Check package.json configuration');
    log('blue', '4. Review ci-cd-operational-guide.md for setup instructions');
  }

  // 10. Useful commands
  log('blue', '\n🛠️  Useful commands:');
  log('blue', '• npm run ci:setup     - Set up CI environment');
  log('blue', '• npm run ci:test      - Run all CI tests');
  log('blue', '• npm run ci:build     - Build for production');
  log('blue', '• npm run test:e2e     - Run end-to-end tests');
  log('blue', '• npm run lint:fix     - Fix linting issues');

  process.exit(allChecks ? 0 : 1);
}

main().catch(error => {
  log('red', `❌ Verification failed: ${error.message}`);
  process.exit(1);
});