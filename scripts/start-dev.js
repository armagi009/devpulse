// Simple script to start the application in development mode
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting DevPulse in development mode...');

try {
  // Start the development server
  console.log('Starting Next.js development server...');
  execSync('npm run dev', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error starting development server:', error.message);
  process.exit(1);
}