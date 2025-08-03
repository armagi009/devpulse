#!/usr/bin/env node

/**
 * Tailwind CSS Troubleshooting Script
 * 
 * This script helps diagnose and fix common Tailwind CSS issues in a Next.js project.
 * It checks for common configuration problems and provides solutions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk'); // You may need to install this: npm install chalk

// Paths to check
const PATHS = {
  tailwindConfig: path.join(process.cwd(), 'tailwind.config.js'),
  postcssConfig: path.join(process.cwd(), 'postcss.config.js'),
  globals: path.join(process.cwd(), 'src/app/globals.css'),
  layout: path.join(process.cwd(), 'src/app/layout.tsx'),
  packageJson: path.join(process.cwd(), 'package.json')
};

console.log(chalk.blue('🔍 Starting Tailwind CSS troubleshooting...\n'));

// Check if files exist
function checkFileExists(filePath, description) {
  console.log(chalk.yellow(`Checking for ${description}...`));
  
  if (fs.existsSync(filePath)) {
    console.log(chalk.green(`✓ Found ${description}`));
    return true;
  } else {
    console.log(chalk.red(`✗ Missing ${description}`));
    return false;
  }
}

// Check tailwind.config.js
const tailwindConfigExists = checkFileExists(PATHS.tailwindConfig, 'tailwind.config.js');
if (tailwindConfigExists) {
  const tailwindConfig = require(PATHS.tailwindConfig);
  console.log(chalk.yellow('Checking tailwind.config.js content paths...'));
  
  const contentPaths = tailwindConfig.content || [];
  if (contentPaths.length === 0) {
    console.log(chalk.red('✗ No content paths defined in tailwind.config.js'));
    console.log(chalk.yellow('  This means Tailwind doesn\'t know which files to scan for classes.'));
  } else {
    console.log(chalk.green('✓ Content paths defined:'));
    contentPaths.forEach(path => console.log(`  - ${path}`));
  }
} else {
  console.log(chalk.yellow('Creating a basic tailwind.config.js file...'));
  
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
  console.log(chalk.green('✓ Created tailwind.config.js'));
}

// Check postcss.config.js
const postcssConfigExists = checkFileExists(PATHS.postcssConfig, 'postcss.config.js');
if (!postcssConfigExists) {
  console.log(chalk.yellow('Creating a basic postcss.config.js file...'));
  
  const postcssConfigContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  fs.writeFileSync(PATHS.postcssConfig, postcssConfigContent);
  console.log(chalk.green('✓ Created postcss.config.js'));
}

// Check globals.css
const globalsExists = checkFileExists(PATHS.globals, 'globals.css');
if (globalsExists) {
  console.log(chalk.yellow('Checking globals.css for Tailwind directives...'));
  
  const globalsContent = fs.readFileSync(PATHS.globals, 'utf8');
  const hasTailwindDirectives = 
    globalsContent.includes('@tailwind base') && 
    globalsContent.includes('@tailwind components') && 
    globalsContent.includes('@tailwind utilities');
  
  if (!hasTailwindDirectives) {
    console.log(chalk.red('✗ Missing Tailwind directives in globals.css'));
    console.log(chalk.yellow('  Adding Tailwind directives to globals.css...'));
    
    const updatedGlobals = `@tailwind base;
@tailwind components;
@tailwind utilities;

${globalsContent}`;
    
    fs.writeFileSync(PATHS.globals, updatedGlobals);
    console.log(chalk.green('✓ Added Tailwind directives to globals.css'));
  } else {
    console.log(chalk.green('✓ Tailwind directives found in globals.css'));
  }
} else {
  console.log(chalk.yellow('Creating globals.css with Tailwind directives...'));
  
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
  console.log(chalk.green('✓ Created globals.css with Tailwind directives'));
}

// Check layout.tsx
const layoutExists = checkFileExists(PATHS.layout, 'layout.tsx');
if (layoutExists) {
  console.log(chalk.yellow('Checking layout.tsx for globals.css import...'));
  
  const layoutContent = fs.readFileSync(PATHS.layout, 'utf8');
  const hasGlobalsImport = layoutContent.includes("import './globals.css'");
  
  if (!hasGlobalsImport) {
    console.log(chalk.red('✗ Missing globals.css import in layout.tsx'));
    console.log(chalk.yellow('  This is critical - Tailwind styles won\'t be loaded without it.'));
    
    // Try to add the import at the top of the file
    const updatedLayout = `import './globals.css';\n${layoutContent}`;
    fs.writeFileSync(PATHS.layout, updatedLayout);
    console.log(chalk.green('✓ Added globals.css import to layout.tsx'));
  } else {
    console.log(chalk.green('✓ globals.css import found in layout.tsx'));
  }
}

// Check package.json for dependencies
const packageJsonExists = checkFileExists(PATHS.packageJson, 'package.json');
if (packageJsonExists) {
  console.log(chalk.yellow('Checking for Tailwind dependencies...'));
  
  const packageJson = require(PATHS.packageJson);
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = ['tailwindcss', 'postcss', 'autoprefixer'];
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length > 0) {
    console.log(chalk.red(`✗ Missing dependencies: ${missingDeps.join(', ')}`));
    console.log(chalk.yellow('  Installing missing dependencies...'));
    
    try {
      execSync(`npm install -D ${missingDeps.join(' ')}`, { stdio: 'inherit' });
      console.log(chalk.green('✓ Installed missing dependencies'));
    } catch (error) {
      console.log(chalk.red('✗ Failed to install dependencies. Please install them manually:'));
      console.log(`  npm install -D ${missingDeps.join(' ')}`);
    }
  } else {
    console.log(chalk.green('✓ All required dependencies are installed'));
  }
}

// Final steps
console.log('\n' + chalk.blue('🧪 Tailwind CSS troubleshooting complete!'));
console.log(chalk.yellow('\nNext steps:'));
console.log('1. Run the development server: npm run dev');
console.log('2. Visit the diagnostic page: http://localhost:3000/dev/css-diagnostic');
console.log('3. If styles are still not working, try rebuilding the project:');
console.log('   npm run build && npm run start');
console.log('\nIf issues persist, check for:');
console.log('- CSS purging issues in production builds');
console.log('- Conflicting CSS that might override Tailwind');
console.log('- Browser caching (try hard refresh: Ctrl+F5)');