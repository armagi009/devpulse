#!/usr/bin/env node

/**
 * Test Vercel Build Locally
 * 
 * This script tests the Vercel build process locally to catch issues
 * before deploying to Vercel.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function header(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function runCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, 'blue');
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd()
    });
    success(`${description} completed successfully`);
    return true;
  } catch (err) {
    error(`${description} failed:`);
    console.log(err.stdout || err.message);
    return false;
  }
}

async function testVercelBuild() {
  header('TESTING VERCEL BUILD LOCALLY');

  let allTestsPassed = true;

  // 1. Check environment variables
  log('\n📋 Checking environment variables...', 'blue');
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET', 
    'NEXTAUTH_URL',
    'GITHUB_ID',
    'GITHUB_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  let missingVars = [];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    warning('Some environment variables are missing (this is OK for local testing):');
    missingVars.forEach(varName => {
      log(`   - ${varName}`, 'yellow');
    });
  } else {
    success('All required environment variables are present');
  }

  // 2. Test Prisma generation
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    allTestsPassed = false;
  }

  // 3. Test TypeScript compilation (if not skipped)
  if (!process.env.SKIP_TYPE_CHECK) {
    if (!runCommand('npx tsc --noEmit', 'TypeScript type checking')) {
      warning('TypeScript errors found, but build will skip them');
    }
  }

  // 4. Test the actual build command
  if (!runCommand('SKIP_ENV_VALIDATION=1 SKIP_TYPE_CHECK=true npm run vercel-build', 'Running Vercel build')) {
    allTestsPassed = false;
  }

  // 5. Check build output
  const buildDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(buildDir)) {
    success('Build output directory created successfully');
    
    // Check for key build files
    const keyFiles = [
      '.next/BUILD_ID',
      '.next/static',
      '.next/server'
    ];
    
    keyFiles.forEach(file => {
      if (fs.existsSync(path.join(process.cwd(), file))) {
        success(`Found ${file}`);
      } else {
        warning(`Missing ${file}`);
      }
    });
  } else {
    error('Build output directory not found');
    allTestsPassed = false;
  }

  header('BUILD TEST SUMMARY');

  if (allTestsPassed) {
    success('🎉 All build tests passed! Your app should deploy successfully to Vercel.');
    
    log('\n📋 Next steps:', 'cyan');
    log('1. Commit your changes: git add . && git commit -m "Fix Vercel build configuration"');
    log('2. Push to trigger Vercel deployment: git push');
    log('3. Monitor the deployment in your Vercel dashboard');
    
  } else {
    error('❌ Some build tests failed. Please fix the issues before deploying to Vercel.');
    
    log('\n🔧 Troubleshooting tips:', 'yellow');
    log('1. Check the error messages above');
    log('2. Ensure all dependencies are installed: npm ci');
    log('3. Verify environment variables are set correctly');
    log('4. Review VERCEL_BUILD_TROUBLESHOOTING.md for more help');
  }

  return allTestsPassed;
}

// Run the test
if (require.main === module) {
  testVercelBuild().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testVercelBuild };