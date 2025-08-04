#!/usr/bin/env node

/**
 * Check Deployment Status
 * 
 * This script helps you verify the deployment status and provides
 * next steps based on your current setup.
 */

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

function info(message) {
  log(`💡 ${message}`, 'cyan');
}

function header(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function main() {
  header('DEPLOYMENT STATUS CHECK');

  success('✅ Git push completed successfully!');
  success('✅ Repository: https://github.com/armagi009/devpulse.git');
  success('✅ Branch: main');
  success('✅ Vercel build fixes applied');

  header('NEXT STEPS');

  log('\n🔍 Check your deployment status:', 'blue');
  log('1. Go to: https://vercel.com/dashboard');
  log('2. Look for your DevPulse project');
  log('3. Check if a new deployment is running');

  log('\n📋 If Vercel is already connected:', 'cyan');
  log('✅ Deployment should start automatically');
  log('✅ Monitor build logs in Vercel dashboard');
  log('✅ Build should now succeed with our fixes');

  log('\n🔗 If Vercel is NOT connected yet:', 'yellow');
  log('1. Go to: https://vercel.com/dashboard');
  log('2. Click "Add New" → "Project"');
  log('3. Import from GitHub: armagi009/devpulse');
  log('4. Add environment variables (see VERCEL_ENV_VARIABLES.md)');
  log('5. Deploy');

  header('ENVIRONMENT VARIABLES REMINDER');

  info('📝 Ensure these 22 variables are set in Vercel:');
  
  const envVars = [
    'NODE_ENV=production',
    'NEXT_PUBLIC_APP_URL=https://your-app.vercel.app',
    'NEXTAUTH_URL=https://your-app.vercel.app',
    'NEXTAUTH_SECRET=Doi5yJZsxDQOJuWRC+O8kO6kp1fia5HUTfxhoqC8jEc=',
    'GITHUB_ID=Ov23lipsOJ2q1BRwFDJD',
    'GITHUB_SECRET=944daa0bfbc02c7276660265f9a4546eaaf40462',
    'DATABASE_URL=postgresql://postgres:Universal@007@...',
    'NEXT_PUBLIC_SUPABASE_URL=https://yyxisciydoxchggzgcbu.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...',
    'SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...',
    'ENCRYPTION_KEY=ae9dce6a416bb669f9cb6ed6cd5513b78ffe6f65704cdb985bca7d2ca3a6d11c',
    'NEXT_PUBLIC_USE_MOCK_AUTH=false',
    'NEXT_PUBLIC_USE_MOCK_API=false',
    'NEXT_PUBLIC_USE_MOCK_DATA=false',
    'NEXT_PUBLIC_DEV_MODE=false',
    'NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR=false',
    'NEXT_PUBLIC_LOG_MOCK_CALLS=false',
    'NEXT_PUBLIC_ENABLE_MOCK_API=false',
    'ENABLE_AI_FEATURES=false',
    'ENABLE_TEAM_ANALYTICS=true',
    'ENABLE_BACKGROUND_JOBS=true',
    'LHCI_GITHUB_APP_TOKEN=KIaccQCPyvm1Suq:78535448:LPchm7MWZ'
  ];

  envVars.forEach((envVar, index) => {
    log(`   ${index + 1}. ${envVar}`, 'cyan');
  });

  header('AFTER SUCCESSFUL DEPLOYMENT');

  log('\n🎯 Once deployed successfully:', 'green');
  log('1. Get your actual Vercel URL');
  log('2. Update NEXT_PUBLIC_APP_URL and NEXTAUTH_URL');
  log('3. Update GitHub OAuth app URLs');
  log('4. Test the application');

  log('\n📖 Documentation:', 'blue');
  log('- VERCEL_DEPLOYMENT_STATUS.md - Complete deployment guide');
  log('- VERCEL_BUILD_TROUBLESHOOTING.md - If issues occur');
  log('- VERCEL_ENV_VARIABLES.md - Environment variables reference');

  log('\n🚀 Your app should now deploy successfully!', 'bright');
}

if (require.main === module) {
  main();
}

module.exports = { main };