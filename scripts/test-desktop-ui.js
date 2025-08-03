/**
 * Test script for desktop UI components
 * 
 * This script helps test the desktop UI components by:
 * 1. Replacing the current dashboard page with the updated version
 * 2. Installing required dependencies
 * 3. Running the application in development mode
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const dashboardPagePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'page.tsx');
const updatedDashboardPagePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'page.tsx.updated');
const backupDashboardPagePath = path.join(__dirname, '..', 'src', 'app', 'dashboard', 'page.tsx.backup');

// Function to backup the current dashboard page
function backupDashboardPage() {
  console.log('Backing up current dashboard page...');
  if (fs.existsSync(dashboardPagePath)) {
    fs.copyFileSync(dashboardPagePath, backupDashboardPagePath);
    console.log('Dashboard page backed up successfully.');
  } else {
    console.error('Dashboard page not found.');
    process.exit(1);
  }
}

// Function to restore the dashboard page from backup
function restoreDashboardPage() {
  console.log('Restoring dashboard page from backup...');
  if (fs.existsSync(backupDashboardPagePath)) {
    fs.copyFileSync(backupDashboardPagePath, dashboardPagePath);
    console.log('Dashboard page restored successfully.');
  } else {
    console.error('Dashboard page backup not found.');
  }
}

// Function to replace the dashboard page with the updated version
function replaceDashboardPage() {
  console.log('Replacing dashboard page with updated version...');
  if (fs.existsSync(updatedDashboardPagePath)) {
    fs.copyFileSync(updatedDashboardPagePath, dashboardPagePath);
    console.log('Dashboard page replaced successfully.');
  } else {
    console.error('Updated dashboard page not found.');
    restoreDashboardPage();
    process.exit(1);
  }
}

// Function to install required dependencies
function installDependencies() {
  console.log('Installing required dependencies...');
  try {
    // Install clsx and tailwind-merge if not already installed
    execSync('npm install clsx tailwind-merge --save', { stdio: 'inherit' });
    console.log('Dependencies installed successfully.');
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    restoreDashboardPage();
    process.exit(1);
  }
}

// Function to run the application in development mode
function runApplication() {
  console.log('Running the application in development mode...');
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to run the application:', error);
    restoreDashboardPage();
    process.exit(1);
  }
}

// Main function
function main() {
  // Register cleanup function to restore dashboard page on exit
  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Cleaning up...');
    restoreDashboardPage();
    process.exit(0);
  });

  // Backup the current dashboard page
  backupDashboardPage();

  // Replace the dashboard page with the updated version
  replaceDashboardPage();

  // Install required dependencies
  installDependencies();

  // Run the application in development mode
  runApplication();
}

// Run the main function
main();