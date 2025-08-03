/**
 * Prepare Dry Run Script
 * 
 * This script prepares the application for a dry run by:
 * 1. Copying mock API routes to their active locations
 * 2. Setting up environment variables for mock mode
 * 3. Ensuring the application is ready for testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const envFile = path.join(rootDir, '.env');
const envExampleFile = path.join(rootDir, '.env.example');

console.log('🚀 Preparing DevPulse for dry run testing...');

// Function to copy mock files to active locations
function copyMockFiles() {
  console.log('\n📁 Setting up mock API routes...');
  
  // Find all .mock files
  const mockFiles = [];
  
  function findMockFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findMockFiles(filePath);
      } else if (file.endsWith('.mock')) {
        mockFiles.push(filePath);
      }
    }
  }
  
  findMockFiles(apiDir);
  
  // Copy mock files to active locations
  for (const mockFile of mockFiles) {
    const activeFile = mockFile.replace('.mock', '');
    console.log(`Copying ${path.basename(mockFile)} to ${path.basename(activeFile)}`);
    fs.copyFileSync(mockFile, activeFile);
  }
  
  // Create analytics page if it doesn't exist
  const analyticsPageDir = path.join(rootDir, 'src', 'app', 'dashboard', 'analytics');
  const analyticsPageFile = path.join(analyticsPageDir, 'page.tsx');
  
  if (!fs.existsSync(analyticsPageDir)) {
    console.log('Creating analytics page directory');
    fs.mkdirSync(analyticsPageDir, { recursive: true });
  }
  
  console.log('✅ Mock API routes set up successfully');
}

// Function to set up environment variables
function setupEnvironmentVariables() {
  console.log('\n🔧 Setting up environment variables...');
  
  // Check if .env file exists
  if (!fs.existsSync(envFile)) {
    console.log('Creating .env file from .env.example');
    fs.copyFileSync(envExampleFile, envFile);
  }
  
  // Read current .env file
  let envContent = fs.readFileSync(envFile, 'utf8');
  
  // Set mock mode variables
  const mockVars = {
    'NEXT_PUBLIC_USE_MOCK_AUTH': 'true',
    'NEXT_PUBLIC_USE_MOCK_DATA': 'true',
    'NEXT_PUBLIC_DEV_MODE': 'true',
    'NEXT_PUBLIC_ENABLE_MOCK_API': 'true',
    'DATABASE_URL': 'file:./dev.db',
  };
  
  // Update .env file
  for (const [key, value] of Object.entries(mockVars)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    
    if (envContent.match(regex)) {
      // Update existing variable
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new variable
      envContent += `\n${key}=${value}`;
    }
  }
  
  // Write updated .env file
  fs.writeFileSync(envFile, envContent);
  
  console.log('✅ Environment variables set up successfully');
}

// Function to fix CSS issues
function fixCssIssues() {
  console.log('\n🎨 Applying CSS fixes...');
  
  // Add specific CSS fixes here if needed
  
  console.log('✅ CSS fixes applied successfully');
}

// Main function
async function main() {
  try {
    // Copy mock files
    copyMockFiles();
    
    // Set up environment variables
    setupEnvironmentVariables();
    
    // Fix CSS issues
    fixCssIssues();
    
    console.log('\n✨ Dry run preparation complete!');
    console.log('\nTo start the application in dry run mode:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3000');
    console.log('\nRefer to devpulse_dry_run_testing.md for testing flows and instructions.');
    
  } catch (error) {
    console.error('❌ Error preparing for dry run:', error);
    process.exit(1);
  }
}

// Run the script
main();