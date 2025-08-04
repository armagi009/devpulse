#!/usr/bin/env node

/**
 * Supabase Service Role Key Helper
 * 
 * This script guides you to get the missing Supabase Service Role Key
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
  header('GET SUPABASE SERVICE ROLE KEY');
  
  success('✅ Database connection is working!');
  log('Your DATABASE_URL has been updated and tested successfully.');
  
  warning('⚠️  You still need ONE more credential from Supabase:');
  
  step('SUPABASE SERVICE ROLE KEY');
  
  log('\n🔑 How to get it:', 'bright');
  log('1. Go to: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu');
  log('2. Click on "Settings" in the left sidebar');
  log('3. Click on "API" in the settings menu');
  log('4. Scroll down to "Project API keys"');
  log('5. Copy the "service_role" key (NOT the "anon" key)');
  log('');
  log('⚠️  The service_role key is different from the anon key you already have!');
  log('⚠️  It starts with "eyJ..." and is much longer');
  log('⚠️  This key has admin privileges - keep it secure!');
  
  step('WHAT TO DO WITH THE KEY');
  
  log('\n📝 Once you have the service_role key:', 'bright');
  log('1. Edit the file: .env.production');
  log('2. Find this line:');
  log('   SUPABASE_SERVICE_ROLE_KEY=[GET_FROM_SUPABASE_DASHBOARD]');
  log('3. Replace [GET_FROM_SUPABASE_DASHBOARD] with your actual service_role key');
  log('4. Save the file');
  
  step('VERIFICATION');
  
  log('\n🔍 After updating the key, run:', 'bright');
  log('   node scripts/verify-external-services.js');
  log('');
  log('This will verify that all your credentials are properly configured.');
  
  header('NEXT STEPS AFTER GETTING THE KEY');
  
  log('\n📋 Once you have the service_role key:', 'blue');
  log('1. ✅ Update .env.production with the service_role key');
  log('2. ✅ Add all environment variables to Vercel');
  log('3. ✅ Set up SonarCloud and get SONAR_TOKEN');
  log('4. ✅ Add GitHub secrets (VERCEL_TOKEN, SONAR_TOKEN, etc.)');
  log('5. ✅ Enable CI/CD pipeline');
  log('6. ✅ Test with a pull request');
  
  info('\n💡 You\'re almost done! Just need this one more credential.');
  
  log('\n🎯 Quick Links:', 'bright');
  log('• Supabase Dashboard: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu');
  log('• Settings → API: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu/settings/api');
  
  success('\n🚀 After getting the service_role key, you\'ll be ready for Vercel deployment!');
}

// Run the guide
if (require.main === module) {
  main();
}

module.exports = { main };