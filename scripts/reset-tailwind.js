#!/usr/bin/env node

/**
 * Tailwind CSS Reset Script
 * 
 * This script completely resets and rebuilds the Tailwind CSS configuration.
 * Use this when you need a fresh start with Tailwind CSS.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk'); // You may need to install this: npm install chalk

console.log(chalk.blue('🔄 Starting Tailwind CSS reset process...\n'));

// Paths
const PATHS = {
  tailwindConfig: path.join(process.cwd(), 'tailwind.config.js'),
  postcssConfig: path.join(process.cwd(), 'postcss.config.js'),
  globals: path.join(process.cwd(), 'src/app/globals.css'),
  nodeModules: path.join(process.cwd(), 'node_modules'),
  packageJson: path.join(process.cwd(), 'package.json'),
  nextCache: path.join(process.cwd(), '.next')
};

// Step 1: Backup existing files
console.log(chalk.yellow('Creating backups of existing configuration files...'));

function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup-${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(chalk.green(`✓ Backed up ${path.basename(filePath)} to ${path.basename(backupPath)}`));
    return true;
  }
  return false;
}

backupFile(PATHS.tailwindConfig);
backupFile(PATHS.postcssConfig);
backupFile(PATHS.globals);

// Step 2: Remove existing Tailwind configuration
console.log(chalk.yellow('\nRemoving existing Tailwind configuration...'));

function safeDeleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(chalk.green(`✓ Deleted ${path.basename(filePath)}`));
  }
}

safeDeleteFile(PATHS.tailwindConfig);
safeDeleteFile(PATHS.postcssConfig);

// Step 3: Clean cache
console.log(chalk.yellow('\nCleaning Next.js cache...'));

if (fs.existsSync(PATHS.nextCache)) {
  try {
    fs.rmSync(PATHS.nextCache, { recursive: true, force: true });
    console.log(chalk.green('✓ Cleared Next.js cache'));
  } catch (error) {
    console.log(chalk.red(`✗ Failed to clear Next.js cache: ${error.message}`));
  }
}

// Step 4: Create new configuration files
console.log(chalk.yellow('\nCreating new Tailwind configuration files...'));

// tailwind.config.js
const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

fs.writeFileSync(PATHS.tailwindConfig, tailwindConfigContent);
console.log(chalk.green('✓ Created new tailwind.config.js'));

// postcss.config.js
const postcssConfigContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

fs.writeFileSync(PATHS.postcssConfig, postcssConfigContent);
console.log(chalk.green('✓ Created new postcss.config.js'));

// Update globals.css
if (fs.existsSync(PATHS.globals)) {
  console.log(chalk.yellow('\nUpdating globals.css...'));
  
  let globalsContent = fs.readFileSync(PATHS.globals, 'utf8');
  
  // Remove existing Tailwind directives
  globalsContent = globalsContent
    .replace(/@tailwind base;/g, '')
    .replace(/@tailwind components;/g, '')
    .replace(/@tailwind utilities;/g, '')
    .trim();
  
  // Add Tailwind directives at the top
  const updatedGlobals = `@tailwind base;
@tailwind components;
@tailwind utilities;

${globalsContent}`;
  
  fs.writeFileSync(PATHS.globals, updatedGlobals);
  console.log(chalk.green('✓ Updated globals.css with Tailwind directives'));
} else {
  console.log(chalk.yellow('\nCreating new globals.css...'));
  
  // Ensure the directory exists
  const globalsDir = path.dirname(PATHS.globals);
  if (!fs.existsSync(globalsDir)) {
    fs.mkdirSync(globalsDir, { recursive: true });
  }
  
  const globalsContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles below */
`;
  
  fs.writeFileSync(PATHS.globals, globalsContent);
  console.log(chalk.green('✓ Created new globals.css with Tailwind directives'));
}

// Step 5: Reinstall dependencies
console.log(chalk.yellow('\nReinstalling Tailwind CSS dependencies...'));

try {
  execSync('npm uninstall tailwindcss postcss autoprefixer', { stdio: 'inherit' });
  execSync('npm install -D tailwindcss postcss autoprefixer', { stdio: 'inherit' });
  console.log(chalk.green('✓ Reinstalled Tailwind CSS dependencies'));
} catch (error) {
  console.log(chalk.red('✗ Failed to reinstall dependencies. Please install them manually:'));
  console.log('  npm install -D tailwindcss postcss autoprefixer');
}

// Step 6: Initialize Tailwind CSS
console.log(chalk.yellow('\nInitializing Tailwind CSS...'));

try {
  execSync('npx tailwindcss init -p', { stdio: 'inherit' });
  console.log(chalk.green('✓ Initialized Tailwind CSS'));
} catch (error) {
  console.log(chalk.red('✗ Failed to initialize Tailwind CSS. Please run manually:'));
  console.log('  npx tailwindcss init -p');
}

// Final steps
console.log('\n' + chalk.blue('🎉 Tailwind CSS reset complete!'));
console.log(chalk.yellow('\nNext steps:'));
console.log('1. Run the development server: npm run dev');
console.log('2. Visit the diagnostic page: http://localhost:3000/dev/css-diagnostic');
console.log('3. Check the Tailwind test page: http://localhost:3000/dev/tailwind-test');
console.log('\nIf issues persist:');
console.log('- Check for CSS conflicts in your application');
console.log('- Verify that globals.css is imported in your layout.tsx file');
console.log('- Try a hard refresh in your browser (Ctrl+F5)');