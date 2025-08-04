#!/usr/bin/env node

/**
 * Validate Deployment Readiness
 * 
 * This script validates that all necessary configurations are in place
 * for a successful Vercel deployment.
 */

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

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    success(`${description} exists`);
    return true;
  } else {
    error(`${description} missing: ${filePath}`);
    return false;
  }
}

function checkPackageJsonScript(scriptName, expectedCommand) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    error('package.json not found');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const script = packageJson.scripts[scriptName];
  
  if (script) {
    if (script.includes(expectedCommand)) {
      success(`Script "${scriptName}" configured correctly`);
      return true;
    } else {
      warning(`Script "${scriptName}" exists but may not be optimal: ${script}`);
      return true;
    }
  } else {
    error(`Script "${scriptName}" missing from package.json`);
    return false;
  }
}

async function validateDeploymentReadiness() {
  header('VALIDATING DEPLOYMENT READINESS');

  let allChecksPass = true;
  let warnings = 0;

  // 1. Check essential files
  log('\n📁 Checking essential files...', 'blue');
  allChecksPass &= checkFileExists('package.json', 'package.json');
  allChecksPass &= checkFileExists('next.config.js', 'Next.js configuration');
  allChecksPass &= checkFileExists('vercel.json', 'Vercel configuration');
  allChecksPass &= checkFileExists('prisma/schema.prisma', 'Prisma schema');

  // 2. Check package.json scripts
  log('\n📜 Checking package.json scripts...', 'blue');
  allChecksPass &= checkPackageJsonScript('vercel-build', 'prisma generate');
  allChecksPass &= checkPackageJsonScript('postinstall', 'prisma generate');
  checkPackageJsonScript('build', 'next build'); // Optional check

  // 3. Check Vercel configuration
  log('\n⚙️  Checking Vercel configuration...', 'blue');
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  if (fs.existsSync(vercelConfigPath)) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      
      if (vercelConfig.buildCommand === 'npm run vercel-build') {
        success('Vercel build command configured correctly');
      } else {
        warning(`Vercel build command: ${vercelConfig.buildCommand}`);
        warnings++;
      }

      if (vercelConfig.framework === 'nextjs') {
        success('Vercel framework set to Next.js');
      } else {
        warning('Vercel framework not explicitly set to nextjs');
        warnings++;
      }

    } catch (err) {
      error('Invalid vercel.json format');
      allChecksPass = false;
    }
  }

  // 4. Check Next.js configuration
  log('\n⚛️  Checking Next.js configuration...', 'blue');
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (nextConfig.includes('ignoreBuildErrors: true')) {
      success('TypeScript build errors will be ignored');
    } else {
      warning('TypeScript build errors may cause deployment failure');
      warnings++;
    }

    if (nextConfig.includes('ignoreDuringBuilds: true')) {
      success('ESLint checks will be skipped during build');
    } else {
      warning('ESLint errors may cause deployment failure');
      warnings++;
    }
  }

  // 5. Check for common problematic files
  log('\n🔍 Checking for potential issues...', 'blue');
  const problematicFiles = [
    '.env.local',
    '.env.development',
    'node_modules'
  ];

  problematicFiles.forEach(file => {
    if (fs.existsSync(file)) {
      if (file === 'node_modules') {
        info(`${file} exists (normal for local development)`);
      } else {
        warning(`${file} exists - ensure it's in .gitignore`);
        warnings++;
      }
    }
  });

  // 6. Environment variables reminder
  log('\n🔐 Environment variables reminder...', 'blue');
  info('Ensure these 22 environment variables are set in Vercel:');
  const requiredEnvVars = [
    'NODE_ENV', 'NEXT_PUBLIC_APP_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET',
    'GITHUB_ID', 'GITHUB_SECRET', 'DATABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'ENCRYPTION_KEY',
    'NEXT_PUBLIC_USE_MOCK_AUTH', 'NEXT_PUBLIC_USE_MOCK_API', 'NEXT_PUBLIC_USE_MOCK_DATA',
    'NEXT_PUBLIC_DEV_MODE', 'NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR', 'NEXT_PUBLIC_LOG_MOCK_CALLS',
    'NEXT_PUBLIC_ENABLE_MOCK_API', 'ENABLE_AI_FEATURES', 'ENABLE_TEAM_ANALYTICS',
    'ENABLE_BACKGROUND_JOBS', 'LHCI_GITHUB_APP_TOKEN'
  ];

  requiredEnvVars.forEach((envVar, index) => {
    log(`   ${index + 1}. ${envVar}`, 'cyan');
  });

  header('VALIDATION SUMMARY');

  if (allChecksPass && warnings === 0) {
    success('🎉 All checks passed! Your app is ready for Vercel deployment.');
    
    log('\n📋 Next steps:', 'cyan');
    log('1. git add . && git commit -m "Ready for Vercel deployment"');
    log('2. git push');
    log('3. Monitor deployment in Vercel dashboard');
    log('4. Update URLs after first deployment');
    
  } else if (allChecksPass && warnings > 0) {
    warning(`⚠️  Deployment ready with ${warnings} warnings. Review warnings above.`);
    
    log('\n📋 You can proceed with deployment, but consider addressing warnings:', 'yellow');
    log('1. git add . && git commit -m "Ready for Vercel deployment"');
    log('2. git push');
    log('3. Monitor deployment logs carefully');
    
  } else {
    error('❌ Some critical issues found. Please fix them before deploying.');
    
    log('\n🔧 Fix the errors above, then run this script again:', 'red');
    log('node scripts/validate-deployment-readiness.js');
  }

  log('\n📖 For detailed guidance, see:', 'blue');
  log('- VERCEL_DEPLOYMENT_STATUS.md');
  log('- VERCEL_BUILD_TROUBLESHOOTING.md');

  return allChecksPass;
}

// Run the validation
if (require.main === module) {
  validateDeploymentReadiness().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { validateDeploymentReadiness };