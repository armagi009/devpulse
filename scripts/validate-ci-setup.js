#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating CI/CD Setup...\n');

// Check required files
const requiredFiles = [
  '../../.github/workflows/ci.yml',
  '../../.github/workflows/code-quality.yml',
  '../../.github/workflows/dependency-updates.yml',
  '../../.github/workflows/release.yml',
  '../../.github/workflows/monitoring.yml',
  '../lighthouserc.js',
  '../sonar-project.properties',
  '../.prettierrc',
  '../.prettierignore',
];

console.log('📁 Checking required files...');
let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file}`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ Missing files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const requiredScripts = [
  'lint',
  'lint:fix',
  'type-check',
  'test:ci',
  'test:e2e:ci',
  'ci:setup',
  'ci:test',
  'ci:build',
  'ci:e2e',
  'audit:security',
];

requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script}`);
  } else {
    console.log(`❌ ${script}`);
  }
});

// Check dependencies
console.log('\n📚 Checking dev dependencies...');
const requiredDevDeps = [
  'better-npm-audit',
  'eslint-config-prettier',
  'npm-check-updates',
  'prettier',
];

requiredDevDeps.forEach(dep => {
  if (packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep}`);
  }
});

// Test scripts
console.log('\n🧪 Testing CI scripts...');

try {
  console.log('Testing lint...');
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('✅ Lint passed');
} catch (error) {
  console.log('❌ Lint failed');
}

try {
  console.log('Testing type check...');
  execSync('npm run type-check', { stdio: 'pipe' });
  console.log('✅ Type check passed');
} catch (error) {
  console.log('❌ Type check failed');
}

try {
  console.log('Testing build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build passed');
} catch (error) {
  console.log('❌ Build failed');
}

// Check environment variables
console.log('\n🔐 Checking environment setup...');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GITHUB_ID',
  'GITHUB_SECRET',
];

const envExample = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf8');

requiredEnvVars.forEach(envVar => {
  if (envExample.includes(envVar)) {
    console.log(`✅ ${envVar} documented in .env.example`);
  } else {
    console.log(`❌ ${envVar} missing from .env.example`);
  }
});

console.log('\n✅ CI/CD setup validation complete!');
console.log('\n📋 Next steps:');
console.log('1. Set up GitHub secrets for deployment');
console.log('2. Configure Vercel integration');
console.log('3. Set up SonarCloud project');
console.log('4. Configure Slack notifications (optional)');
console.log('5. Test the pipeline with a pull request');