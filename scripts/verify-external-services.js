#!/usr/bin/env node

/**
 * External Services Verification Script
 * 
 * This script verifies that all external services are properly configured:
 * - Database connection (Supabase)
 * - Environment variables
 * - GitHub repository setup
 * - CI/CD configuration
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

function header(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
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

// Check if required files exist
function checkRequiredFiles() {
  header('CHECKING REQUIRED FILES');
  
  const requiredFiles = [
    '.env.production',
    'package.json',
    'prisma/schema.prisma',
    'sonar-project.properties',
    '.github/workflows/ci-cd-pipeline.yml'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      success(`${file} exists`);
    } else {
      error(`${file} is missing`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// Check environment variables
function checkEnvironmentVariables() {
  header('CHECKING ENVIRONMENT VARIABLES');
  
  const envPath = path.join(process.cwd(), '.env.production');
  if (!fs.existsSync(envPath)) {
    error('.env.production file not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GITHUB_ID',
    'GITHUB_SECRET',
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ENCRYPTION_KEY'
  ];
  
  let allVarsPresent = true;
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      // Check if it has a placeholder value
      if (envContent.includes(`${varName}=[`) || envContent.includes(`${varName}=your-`)) {
        warning(`${varName} has placeholder value - needs to be updated`);
        allVarsPresent = false;
      } else {
        success(`${varName} is configured`);
      }
    } else {
      error(`${varName} is missing`);
      allVarsPresent = false;
    }
  });
  
  return allVarsPresent;
}

// Test database connection
function testDatabaseConnection() {
  header('TESTING DATABASE CONNECTION');
  
  try {
    // Check if Prisma is configured
    if (!fs.existsSync('prisma/schema.prisma')) {
      error('Prisma schema not found');
      return false;
    }
    
    success('Prisma schema found');
    
    // Try to generate Prisma client
    try {
      execSync('npx prisma generate', { stdio: 'ignore' });
      success('Prisma client generated successfully');
    } catch (e) {
      warning('Prisma client generation failed - check DATABASE_URL');
      return false;
    }
    
    info('💡 To test database connection with your actual DATABASE_URL:');
    info('   1. Update DATABASE_URL in .env.production with your Supabase password');
    info('   2. Run: npm run db:push');
    info('   3. If successful, your database is ready for production');
    
    return true;
  } catch (e) {
    error(`Database connection test failed: ${e.message}`);
    return false;
  }
}

// Check GitHub repository configuration
function checkGitHubConfiguration() {
  header('CHECKING GITHUB CONFIGURATION');
  
  try {
    // Check if we're in a git repository
    execSync('git status', { stdio: 'ignore' });
    success('Git repository detected');
    
    // Check remote origin
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    if (remoteUrl.includes('github.com')) {
      success(`GitHub repository: ${remoteUrl}`);
    } else {
      warning('Remote origin is not a GitHub repository');
      return false;
    }
    
    // Check if workflows directory exists
    if (fs.existsSync('.github/workflows')) {
      success('GitHub workflows directory exists');
      
      // Check for CI/CD workflow
      const workflowFiles = fs.readdirSync('.github/workflows');
      if (workflowFiles.length > 0) {
        success(`Found ${workflowFiles.length} workflow file(s)`);
        workflowFiles.forEach(file => {
          info(`   • ${file}`);
        });
      } else {
        warning('No workflow files found');
      }
    } else {
      warning('GitHub workflows directory not found');
    }
    
    return true;
  } catch (e) {
    error(`GitHub configuration check failed: ${e.message}`);
    return false;
  }
}

// Check CI/CD configuration
function checkCICDConfiguration() {
  header('CHECKING CI/CD CONFIGURATION');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error('package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredScripts = [
    'lint',
    'type-check',
    'test',
    'ci:build',
    'db:generate',
    'db:push'
  ];
  
  let allScriptsPresent = true;
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      success(`Script "${script}" is configured`);
    } else {
      error(`Script "${script}" is missing`);
      allScriptsPresent = false;
    }
  });
  
  // Check SonarCloud configuration
  if (fs.existsSync('sonar-project.properties')) {
    success('SonarCloud configuration found');
  } else {
    warning('SonarCloud configuration not found');
  }
  
  return allScriptsPresent;
}

// Display next steps
function displayNextSteps() {
  header('NEXT STEPS');
  
  log('\n📋 To complete your production deployment:', 'blue');
  
  log('\n1. 🗄️  Complete Supabase Setup:', 'bright');
  log('   • Go to: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu');
  log('   • Settings → Database → Copy connection string');
  log('   • Settings → API → Copy service_role key');
  log('   • Update DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.production');
  
  log('\n2. 🚀 Configure Vercel:', 'bright');
  log('   • Go to your Vercel project dashboard');
  log('   • Settings → Environment Variables');
  log('   • Add all variables from .env.production');
  log('   • Update NEXT_PUBLIC_APP_URL and NEXTAUTH_URL with your Vercel URL');
  
  log('\n3. 🔍 Set up SonarCloud:', 'bright');
  log('   • Go to: https://sonarcloud.io');
  log('   • Sign up with GitHub account');
  log('   • Import your repository');
  log('   • Get SONAR_TOKEN from My Account → Security');
  
  log('\n4. 🔑 Add GitHub Secrets:', 'bright');
  log('   • Go to: https://github.com/armagi009/devpulse/settings/secrets/actions');
  log('   • Add VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
  log('   • Add SONAR_TOKEN');
  log('   • Add SNYK_TOKEN (optional)');
  
  log('\n5. 🧪 Test with Pull Request:', 'bright');
  log('   • Create test branch: git checkout -b test/ci-pipeline');
  log('   • Make small change and push');
  log('   • Create PR and verify all checks pass');
  
  info('\n💡 Run this script again after each step to verify your progress!');
}

// Main verification function
function main() {
  header('DEVPULSE EXTERNAL SERVICES VERIFICATION');
  
  log('This script verifies your external services configuration', 'bright');
  log('and helps identify what still needs to be set up.\n');
  
  let overallStatus = true;
  
  // Run all checks
  overallStatus &= checkRequiredFiles();
  overallStatus &= checkEnvironmentVariables();
  overallStatus &= testDatabaseConnection();
  overallStatus &= checkGitHubConfiguration();
  overallStatus &= checkCICDConfiguration();
  
  // Display results
  header('VERIFICATION RESULTS');
  
  if (overallStatus) {
    success('🎉 All checks passed! Your configuration looks good.');
    info('💡 Complete the remaining setup steps and you\'ll be ready to deploy!');
  } else {
    warning('⚠️  Some issues were found. Please address them before proceeding.');
    error('❌ Check the details above and fix any missing or incorrect configurations.');
  }
  
  // Always show next steps
  displayNextSteps();
  
  return overallStatus;
}

// Run the verification
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = {
  checkRequiredFiles,
  checkEnvironmentVariables,
  testDatabaseConnection,
  checkGitHubConfiguration,
  checkCICDConfiguration
};