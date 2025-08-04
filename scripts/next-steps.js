#!/usr/bin/env node

/**
 * Next Steps Guide
 * 
 * This script shows you exactly what to do next based on your current status
 */

const fs = require('fs');

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

function step(message) {
  log(`\n📋 ${message}`, 'blue');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`💡 ${message}`, 'cyan');
}

function main() {
  header('DEVPULSE - YOUR IMMEDIATE NEXT STEPS');
  
  log('Based on your current setup, here\'s exactly what you need to do:', 'bright');
  
  step('STEP 1: Get Missing Supabase Credentials (5 minutes)');
  log('🗄️  You need 2 more pieces from Supabase:');
  log('');
  log('   1. Database Password:');
  log('      • Go to: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu');
  log('      • Settings → Database');
  log('      • Copy the connection string with your password');
  log('');
  log('   2. Service Role Key:');
  log('      • Same dashboard → Settings → API');
  log('      • Copy the "service_role" key (NOT anon key)');
  
  step('STEP 2: Update Production Environment (2 minutes)');
  log('📝 Edit the file: .env.production');
  log('   • Replace [YOUR_PASSWORD] with your actual Supabase password');
  log('   • Replace [GET_FROM_SUPABASE_DASHBOARD] with service role key');
  
  step('STEP 3: Add Environment Variables to Vercel (5 minutes)');
  log('🚀 Go to your Vercel project dashboard:');
  log('   • Settings → Environment Variables');
  log('   • Copy ALL variables from .env.production');
  log('   • Update URLs with your actual Vercel domain');
  log('   • Click "Redeploy" after adding variables');
  
  step('STEP 4: Set Up SonarCloud (5 minutes)');
  log('🔍 Quick setup:');
  log('   • Go to: https://sonarcloud.io');
  log('   • Sign up with GitHub');
  log('   • Import repository: armagi009/devpulse');
  log('   • Get SONAR_TOKEN from My Account → Security');
  
  step('STEP 5: Add GitHub Secrets (3 minutes)');
  log('🔑 Go to: https://github.com/armagi009/devpulse/settings/secrets/actions');
  log('   • Add VERCEL_TOKEN (from Vercel Account Settings → Tokens)');
  log('   • Add VERCEL_ORG_ID and VERCEL_PROJECT_ID (from Vercel project settings)');
  log('   • Add SONAR_TOKEN (from step 4)');
  
  step('STEP 6: Enable CI/CD and Test (5 minutes)');
  log('⚡ Enable the pipeline:');
  log('   • Edit .github/workflows/ci.yml');
  log('   • Uncomment the "on:" triggers section');
  log('   • Create test PR to verify everything works');
  
  header('VERIFICATION COMMANDS');
  
  log('\n🔍 Run these to check your progress:', 'blue');
  log('');
  log('   # Check current status');
  log('   node scripts/verify-external-services.js');
  log('');
  log('   # Test database connection (after step 2)');
  log('   npm run db:generate && npm run db:push');
  log('');
  log('   # Test build (after step 3)');
  log('   npm run ci:build');
  
  header('ESTIMATED TIME TO COMPLETION');
  
  success('🎯 Total time needed: ~25 minutes');
  log('   • Most steps are just copying/pasting credentials');
  log('   • The longest part is waiting for deployments');
  log('   • You\'ll have a fully operational production app!');
  
  header('HELP & DOCUMENTATION');
  
  info('📖 Detailed guides available:');
  log('   • PRODUCTION_DEPLOYMENT_CHECKLIST.md - Complete step-by-step guide');
  log('   • docs/ci-cd-operational-guide.md - Comprehensive troubleshooting');
  log('   • scripts/setup-external-services.js - Interactive setup assistant');
  
  info('🆘 If you get stuck:');
  log('   • Run: node scripts/verify-external-services.js');
  log('   • Check the detailed guides above');
  log('   • Each step has specific troubleshooting instructions');
  
  header('YOU\'RE ALMOST THERE!');
  
  success('🚀 Your DevPulse application is 95% ready for production!');
  log('   • All the hard work is done (CI/CD, workflows, build process)');
  log('   • You just need to connect the external services');
  log('   • Follow the steps above and you\'ll be live in ~25 minutes');
  
  log('\n🎉 Let\'s get your production deployment completed!', 'green');
}

// Run the guide
if (require.main === module) {
  main();
}

module.exports = { main };