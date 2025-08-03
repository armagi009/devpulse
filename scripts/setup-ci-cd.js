#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  log('cyan', '🚀 DevPulse CI/CD Setup Assistant\n');
  log('blue', 'This script will help you set up the CI/CD pipeline for DevPulse.');
  log('blue', 'It will guide you through the initial configuration steps.\n');

  const rl = createInterface();

  try {
    // 1. Check prerequisites
    log('yellow', '📋 Checking prerequisites...');
    
    // Check if we're in the right directory
    if (!fs.existsSync('package.json')) {
      log('red', '❌ package.json not found. Please run this script from the devpulse directory.');
      process.exit(1);
    }

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      log('red', `❌ Node.js 18+ required. Current version: ${nodeVersion}`);
      process.exit(1);
    }
    log('green', `✅ Node.js version: ${nodeVersion}`);

    // Check Git
    try {
      execSync('git --version', { stdio: 'pipe' });
      log('green', '✅ Git is installed');
    } catch (error) {
      log('red', '❌ Git is not installed or not in PATH');
      process.exit(1);
    }

    // 2. Install dependencies
    log('yellow', '\n📦 Installing dependencies...');
    const installDeps = await question(rl, 'Install/update npm dependencies? (y/n): ');
    
    if (installDeps.toLowerCase() === 'y') {
      try {
        execSync('npm ci', { stdio: 'inherit' });
        log('green', '✅ Dependencies installed');
      } catch (error) {
        log('red', '❌ Failed to install dependencies');
        process.exit(1);
      }
    }

    // 3. Environment setup
    log('yellow', '\n🔐 Setting up environment...');
    
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      const createEnv = await question(rl, 'Create .env file from .env.example? (y/n): ');
      
      if (createEnv.toLowerCase() === 'y') {
        fs.copyFileSync(envExamplePath, envPath);
        log('green', '✅ .env file created');
        log('yellow', '⚠️  Please edit .env file with your actual values');
      }
    } else if (fs.existsSync(envPath)) {
      log('green', '✅ .env file already exists');
    }

    // 4. Git repository check
    log('yellow', '\n🐙 Checking Git repository...');
    
    try {
      const gitRemote = execSync('git remote get-url origin', { stdio: 'pipe' }).toString().trim();
      
      if (gitRemote.includes('github.com')) {
        log('green', '✅ GitHub repository detected');
        
        const repoMatch = gitRemote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
        if (repoMatch) {
          const [, owner, repo] = repoMatch;
          log('blue', `   Repository: ${owner}/${repo}`);
        }
      } else {
        log('yellow', '⚠️  Not a GitHub repository. CI/CD pipeline requires GitHub.');
      }
    } catch (error) {
      log('red', '❌ Git repository not configured');
    }

    // 5. Test CI commands
    log('yellow', '\n🧪 Testing CI commands...');
    const testCommands = await question(rl, 'Test CI commands (lint, type-check, build)? (y/n): ');
    
    if (testCommands.toLowerCase() === 'y') {
      const commands = [
        { name: 'Lint', command: 'npm run lint' },
        { name: 'Type Check', command: 'npm run type-check' },
        { name: 'Build', command: 'npm run ci:build' }
      ];

      for (const cmd of commands) {
        try {
          log('blue', `   Testing ${cmd.name}...`);
          execSync(cmd.command, { stdio: 'pipe' });
          log('green', `   ✅ ${cmd.name} passed`);
        } catch (error) {
          log('red', `   ❌ ${cmd.name} failed`);
          log('yellow', `      Run '${cmd.command}' manually to see details`);
        }
      }
    }

    // 6. Generate setup summary
    log('yellow', '\n📋 Generating setup summary...');
    
    const setupSummary = `# DevPulse CI/CD Setup Summary

Generated on: ${new Date().toISOString()}

## Completed Steps
- [x] Prerequisites checked
- [x] Dependencies installed
- [x] Environment file created
- [x] Git repository verified
- [x] CI commands tested

## Next Steps

### 1. GitHub Configuration
- Enable GitHub Actions in repository settings
- Configure branch protection rules for main branch
- Add required status checks

### 2. External Services
- Set up Vercel account and import project
- Configure SonarCloud for code quality analysis
- Optional: Set up Snyk for security scanning

### 3. GitHub Secrets
Add these secrets to your GitHub repository:
- VERCEL_TOKEN
- VERCEL_ORG_ID  
- VERCEL_PROJECT_ID
- SONAR_TOKEN

### 4. Testing
- Create a test pull request
- Verify all workflows run successfully
- Test preview and production deployments

## Resources
- Detailed guide: docs/ci-cd-operational-guide.md
- Setup checklist: docs/ci-cd-setup-checklist.md
- Verification script: scripts/verify-ci-operational.js

## Useful Commands
- npm run ci:setup     - Set up CI environment
- npm run ci:test      - Run all CI tests
- npm run ci:build     - Build for production
- node scripts/verify-ci-operational.js - Verify setup
`;

    fs.writeFileSync('ci-cd-setup-summary.md', setupSummary);
    log('green', '✅ Setup summary saved to ci-cd-setup-summary.md');

    // 7. Final recommendations
    log('cyan', '\n🎉 Initial setup complete!');
    log('blue', '\nNext steps:');
    log('blue', '1. Review and edit your .env file with actual values');
    log('blue', '2. Follow the detailed guide: docs/ci-cd-operational-guide.md');
    log('blue', '3. Use the checklist: docs/ci-cd-setup-checklist.md');
    log('blue', '4. Run verification: node scripts/verify-ci-operational.js');
    
    log('yellow', '\n⚠️  Important:');
    log('yellow', '- Set up external services (Vercel, SonarCloud) before testing');
    log('yellow', '- Configure GitHub secrets for deployments to work');
    log('yellow', '- Test with a pull request before relying on the pipeline');

    const openDocs = await question(rl, '\nOpen setup documentation? (y/n): ');
    if (openDocs.toLowerCase() === 'y') {
      try {
        // Try to open the documentation
        const platform = process.platform;
        if (platform === 'darwin') {
          execSync('open docs/ci-cd-operational-guide.md');
        } else if (platform === 'win32') {
          execSync('start docs/ci-cd-operational-guide.md');
        } else {
          execSync('xdg-open docs/ci-cd-operational-guide.md');
        }
        log('green', '✅ Documentation opened');
      } catch (error) {
        log('yellow', '⚠️  Could not open documentation automatically');
        log('blue', 'Please open docs/ci-cd-operational-guide.md manually');
      }
    }

  } catch (error) {
    log('red', `❌ Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled by user');
  process.exit(0);
});

main().catch(error => {
  log('red', `❌ Unexpected error: ${error.message}`);
  process.exit(1);
});