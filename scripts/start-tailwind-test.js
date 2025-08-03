#!/usr/bin/env node

/**
 * Start Tailwind Test Script
 * 
 * This script starts the development server and opens the Tailwind verification page.
 */

const { spawn } = require('child_process');
const { exec } = require('child_process');
const chalk = require('chalk'); // You may need to install this: npm install chalk

console.log(chalk.blue('🚀 Starting development server and opening Tailwind verification page...'));

// Start the Next.js development server
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
});

// Wait for the server to start
setTimeout(() => {
  console.log(chalk.green('Opening Tailwind verification page...'));
  
  // Open the verification page in the default browser
  const openCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  exec(`${openCommand} http://localhost:3000/dev/tailwind-verification`);
  
  console.log(chalk.yellow('\nPress Ctrl+C to stop the development server.'));
}, 5000); // Wait 5 seconds for the server to start

// Handle process termination
process.on('SIGINT', () => {
  console.log(chalk.blue('\nShutting down development server...'));
  devServer.kill();
  process.exit(0);
});