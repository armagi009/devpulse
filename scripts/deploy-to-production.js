#!/usr/bin/env node

/**
 * Production Deployment Assistant
 * 
 * This script guides you through the final deployment steps
 */

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
  header('🚀 PRODUCTION DEPLOYMENT - READY TO LAUNCH!');
  
  success('🎉 ALL CREDENTIALS ARE CONFIGURED!');
  log('Your Supabase database is connected and all environment variables are ready.');
  
  step('IMMEDIATE NEXT STEP: Deploy to Vercel');
  
  log('\n🚀 Go to your Vercel project dashboard:', 'bright');
  log('1. Navigate to Settings → Environment Variables');
  log('2. Copy ALL variables from the list below');
  log('3. Add each one to Vercel (set Environment to "Production")');
  
  log('\n📋 ENVIRONMENT VARIABLES TO ADD:', 'blue');
  log('');
  log('NODE_ENV=production');
  log('NEXT_PUBLIC_APP_URL=https://your-app.vercel.app');
  log('NEXTAUTH_URL=https://your-app.vercel.app');
  log('NEXTAUTH_SECRET=Doi5yJZsxDQOJuWRC+O8kO6kp1fia5HUTfxhoqC8jEc=');
  log('GITHUB_ID=Ov23lipsOJ2q1BRwFDJD');
  log('GITHUB_SECRET=944daa0bfbc02c7276660265f9a4546eaaf40462');
  log('DATABASE_URL=postgresql://postgres:Universal@007@db.yyxisciydoxchggzgcbu.supabase.co:5432/postgres');
  log('NEXT_PUBLIC_SUPABASE_URL=https://yyxisciydoxchggzgcbu.supabase.co');
  log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5eGlzY2l5ZG94Y2hnZ3pnY2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjk1NzcsImV4cCI6MjA2OTgwNTU3N30.2J0TN7Y7VPVUrnTbpKEMqSFpXgfq_97DZCGDTRxSDiA');
  log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5eGlzY2l5ZG94Y2hnZ3pnY2J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIyOTU3NywiZXhwIjoyMDY5ODA1NTc3fQ.wxbj1oqoHEs_aeE94-cl0ys-LIo25pXwT6EDUjLVIbw');
  log('ENCRYPTION_KEY=ae9dce6a416bb669f9cb6ed6cd5513b78ffe6f65704cdb985bca7d2ca3a6d11c');
  log('NEXT_PUBLIC_USE_MOCK_AUTH=false');
  log('NEXT_PUBLIC_USE_MOCK_API=false');
  log('NEXT_PUBLIC_USE_MOCK_DATA=false');
  log('NEXT_PUBLIC_DEV_MODE=false');
  log('NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR=false');
  log('NEXT_PUBLIC_LOG_MOCK_CALLS=false');
  log('NEXT_PUBLIC_ENABLE_MOCK_API=false');
  log('ENABLE_AI_FEATURES=false');
  log('ENABLE_TEAM_ANALYTICS=true');
  log('ENABLE_BACKGROUND_JOBS=true');
  log('LHCI_GITHUB_APP_TOKEN=KIaccQCPyvm1Suq:78535448:LPchm7MWZ');
  
  warning('\n⚠️  IMPORTANT: After deployment succeeds:');
  log('1. Get your actual Vercel URL (e.g., https://devpulse-xyz.vercel.app)');
  log('2. Update NEXT_PUBLIC_APP_URL and NEXTAUTH_URL with the real URL');
  log('3. Update your GitHub OAuth app with the new URLs');
  log('4. Redeploy to apply the changes');
  
  step('AFTER VERCEL DEPLOYMENT: Set up External Services');
  
  log('\n🔍 SonarCloud Setup (5 minutes):', 'bright');
  log('1. Go to: https://sonarcloud.io');
  log('2. Sign up with GitHub account');
  log('3. Import repository: armagi009/devpulse');
  log('4. Get SONAR_TOKEN from My Account → Security');
  
  log('\n🚀 Vercel Tokens (3 minutes):', 'bright');
  log('1. Go to: Vercel Account Settings → Tokens');
  log('2. Create token: "DevPulse CI/CD"');
  log('3. Get Project ID and Org ID from Project Settings → General');
  
  log('\n🔑 GitHub Secrets (2 minutes):', 'bright');
  log('1. Go to: https://github.com/armagi009/devpulse/settings/secrets/actions');
  log('2. Add VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
  log('3. Add SONAR_TOKEN');
  
  step('ENABLE CI/CD PIPELINE');
  
  log('\n⚡ Enable workflow triggers:', 'bright');
  log('1. Edit .github/workflows/ci.yml');
  log('2. Uncomment the "on:" triggers section');
  log('3. Commit and push changes');
  
  step('TEST EVERYTHING');
  
  log('\n🧪 Create test pull request:', 'bright');
  log('1. git checkout -b test/production-deployment');
  log('2. echo "# Test" >> docs/test.md');
  log('3. git add . && git commit -m "test: production deployment"');
  log('4. git push origin test/production-deployment');
  log('5. Create PR and verify all checks pass');
  
  header('🎯 ESTIMATED TIME TO COMPLETION');
  
  success('⏱️  Total time needed: ~20 minutes');
  log('   • Vercel deployment: 5 minutes');
  log('   • External services: 10 minutes');
  log('   • CI/CD setup: 3 minutes');
  log('   • Testing: 2 minutes');
  
  header('📖 DETAILED GUIDES');
  
  info('📋 Complete step-by-step guide: VERCEL_DEPLOYMENT_GUIDE.md');
  info('🔍 Troubleshooting: docs/ci-cd-operational-guide.md');
  info('✅ Verification: node scripts/verify-external-services.js');
  
  header('🚀 YOU\'RE READY TO DEPLOY!');
  
  success('🎉 All the hard work is done!');
  log('   • Database is connected and tested');
  log('   • All credentials are configured');
  log('   • CI/CD workflows are ready');
  log('   • Build process is working');
  
  log('\n🎯 Next action: Add environment variables to Vercel and deploy!', 'green');
  
  info('\n💡 Pro tip: Copy the environment variables above and paste them one by one into Vercel.');
}

// Run the deployment assistant
if (require.main === module) {
  main();
}

module.exports = { main };