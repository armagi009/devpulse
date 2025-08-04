#!/usr/bin/env node

/**
 * Production Environment Setup Script
 * 
 * This script helps you:
 * 1. Get missing Supabase credentials
 * 2. Generate required secrets
 * 3. Create production environment variables
 * 4. Set up external services
 */

const crypto = require('crypto');
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

// Generate secure secrets
function generateSecrets() {
  header('GENERATING PRODUCTION SECRETS');
  
  step('Generating NEXTAUTH_SECRET...');
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');
  success(`NEXTAUTH_SECRET=${nextAuthSecret}`);
  
  step('Generating ENCRYPTION_KEY...');
  const encryptionKey = crypto.randomBytes(32).toString('hex');
  success(`ENCRYPTION_KEY=${encryptionKey}`);
  
  return {
    nextAuthSecret,
    encryptionKey
  };
}

// Display Supabase setup instructions
function displaySupabaseInstructions() {
  header('SUPABASE SETUP INSTRUCTIONS');
  
  log('🗄️  You have provided:', 'bright');
  log('✅ Project URL: https://yyxisciydoxchggzgcbu.supabase.co');
  log('✅ Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  
  warning('\n⚠️  MISSING: You still need to get these from Supabase:');
  
  step('1. Get Database Connection String:');
  log('   • Go to: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu');
  log('   • Settings → Database');
  log('   • Copy the "Connection string" under "Connection parameters"');
  log('   • It should look like: postgresql://postgres:[PASSWORD]@db.yyxisciydoxchggzgcbu.supabase.co:5432/postgres');
  
  step('2. Get Service Role Key:');
  log('   • Go to: https://supabase.com/dashboard/project/yyxisciydoxchggzgcbu');
  log('   • Settings → API');
  log('   • Copy the "service_role" key (NOT the anon key)');
  log('   • This key has admin privileges - keep it secure!');
  
  info('\n💡 Why you need these:');
  log('   • Database URL: For Prisma to connect to your database');
  log('   • Service Role Key: For server-side operations that need admin access');
}

// Create production environment file
function createProductionEnv(secrets) {
  header('CREATING PRODUCTION ENVIRONMENT');
  
  const productionEnv = `# Production Environment Variables for Vercel
# Generated on ${new Date().toISOString()}

# Base Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Authentication (NextAuth.js)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=${secrets.nextAuthSecret}
GITHUB_ID=Ov23lipsOJ2q1BRwFDJD
GITHUB_SECRET=944daa0bfbc02c7276660265f9a4546eaaf40462

# Supabase Configuration
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.yyxisciydoxchggzgcbu.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://yyxisciydoxchggzgcbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5eGlzY2l5ZG94Y2hnZ3pnY2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjk1NzcsImV4cCI6MjA2OTgwNTU3N30.2J0TN7Y7VPVUrnTbpKEMqSFpXgfq_97DZCGDTRxSDiA
SUPABASE_SERVICE_ROLE_KEY=[GET_FROM_SUPABASE_DASHBOARD]

# Security
ENCRYPTION_KEY=${secrets.encryptionKey}

# Production Mode (Disable Mock/Dev Features)
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR=false
NEXT_PUBLIC_LOG_MOCK_CALLS=false
NEXT_PUBLIC_ENABLE_MOCK_API=false

# Feature Flags
ENABLE_AI_FEATURES=false
ENABLE_TEAM_ANALYTICS=true
ENABLE_BACKGROUND_JOBS=true

# CI/CD Integration
LHCI_GITHUB_APP_TOKEN=KIaccQCPyvm1Suq:78535448:LPchm7MWZ`;

  const envPath = path.join(process.cwd(), '.env.production');
  fs.writeFileSync(envPath, productionEnv);
  
  success(`Production environment file created: .env.production`);
  warning('⚠️  Remember to replace [YOUR_PASSWORD] and [GET_FROM_SUPABASE_DASHBOARD] with actual values!');
}

// Display Vercel setup instructions
function displayVercelInstructions() {
  header('VERCEL ENVIRONMENT VARIABLES SETUP');
  
  step('1. Go to your Vercel project dashboard');
  step('2. Navigate to Settings → Environment Variables');
  step('3. Add each variable from .env.production file');
  
  warning('\n⚠️  IMPORTANT: Update these values before adding to Vercel:');
  log('   • NEXT_PUBLIC_APP_URL: Replace with your actual Vercel URL');
  log('   • NEXTAUTH_URL: Replace with your actual Vercel URL');
  log('   • DATABASE_URL: Replace [YOUR_PASSWORD] with your Supabase password');
  log('   • SUPABASE_SERVICE_ROLE_KEY: Get from Supabase dashboard');
  
  info('\n💡 After adding environment variables:');
  log('   • Go to Deployments tab in Vercel');
  log('   • Click "Redeploy" to trigger a new deployment');
  log('   • The deployment should now succeed with proper environment variables');
}

// Display external services setup
function displayExternalServicesSetup() {
  header('EXTERNAL SERVICES SETUP');
  
  step('Next, set up these external services:');
  
  log('\n🔍 SonarCloud (Code Quality):', 'bright');
  log('   1. Go to https://sonarcloud.io');
  log('   2. Sign up with GitHub account');
  log('   3. Import your repository');
  log('   4. Get SONAR_TOKEN from My Account → Security');
  
  log('\n🔒 Snyk (Security Scanning):', 'bright');
  log('   1. Go to https://snyk.io');
  log('   2. Sign up with GitHub account');
  log('   3. Import your repository');
  log('   4. Get SNYK_TOKEN from Account Settings → API Token');
  
  log('\n🚀 Vercel Tokens (For CI/CD):', 'bright');
  log('   1. Go to Vercel Account Settings → Tokens');
  log('   2. Create token: "DevPulse CI/CD"');
  log('   3. Get Project ID and Org ID from Project Settings → General');
  
  info('\n💡 All these tokens will be added to GitHub Secrets in the next step');
}

// Display GitHub secrets setup
function displayGitHubSecretsSetup() {
  header('GITHUB SECRETS SETUP');
  
  step('Add these secrets to GitHub repository:');
  log('   • Go to: https://github.com/armagi009/devpulse/settings/secrets/actions');
  log('   • Click "New repository secret" for each:');
  
  log('\n📋 Required Secrets:', 'blue');
  log('   VERCEL_TOKEN=your_vercel_token');
  log('   VERCEL_ORG_ID=your_vercel_org_id');
  log('   VERCEL_PROJECT_ID=your_vercel_project_id');
  log('   SONAR_TOKEN=your_sonar_token');
  
  log('\n📋 Optional Secrets:', 'blue');
  log('   SNYK_TOKEN=your_snyk_token');
  log('   SLACK_WEBHOOK_URL=your_slack_webhook');
  
  warning('\n⚠️  Double-check secret names for typos - they must match workflow files exactly!');
}

// Main function
function main() {
  header('DEVPULSE PRODUCTION ENVIRONMENT SETUP');
  
  log('This script will help you set up production environment variables', 'bright');
  log('and configure external services for your DevPulse deployment.\n');
  
  // Generate secrets
  const secrets = generateSecrets();
  
  // Display Supabase instructions
  displaySupabaseInstructions();
  
  // Create production environment file
  createProductionEnv(secrets);
  
  // Display setup instructions
  displayVercelInstructions();
  displayExternalServicesSetup();
  displayGitHubSecretsSetup();
  
  header('NEXT STEPS SUMMARY');
  
  log('\n📋 Your Action Items:', 'blue');
  log('1. ✅ Get missing Supabase credentials (DATABASE_URL, SERVICE_ROLE_KEY)');
  log('2. ✅ Update .env.production with actual values');
  log('3. ✅ Add environment variables to Vercel');
  log('4. ✅ Set up SonarCloud and get SONAR_TOKEN');
  log('5. ✅ Set up Snyk and get SNYK_TOKEN (optional)');
  log('6. ✅ Get Vercel tokens for CI/CD');
  log('7. ✅ Add all tokens to GitHub Secrets');
  log('8. ✅ Test with a pull request');
  
  success('\n🎉 Once complete, your production deployment will be fully operational!');
  
  info('\n📖 For detailed troubleshooting: docs/ci-cd-operational-guide.md');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateSecrets, createProductionEnv };