#!/usr/bin/env node

/**
 * Tailwind CSS Verification Script
 * 
 * This script verifies if Tailwind CSS is properly configured and working.
 * It checks configuration files, dependencies, and CSS imports.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk'); // You may need to install this: npm install chalk

console.log(chalk.blue('🔍 Verifying Tailwind CSS configuration...\n'));

// Paths to check
const PATHS = {
  tailwindConfig: path.join(process.cwd(), 'tailwind.config.js'),
  postcssConfig: path.join(process.cwd(), 'postcss.config.js'),
  globals: path.join(process.cwd(), 'devpulse/src/app/globals.css'),
  layout: path.join(process.cwd(), 'devpulse/src/app/layout.tsx'),
  packageJson: path.join(process.cwd(), 'package.json')
};

let issues = 0;
let warnings = 0;

// Check if files exist
function checkFileExists(filePath, description, critical = true) {
  console.log(chalk.yellow(`Checking for ${description}...`));
  
  if (fs.existsSync(filePath)) {
    console.log(chalk.green(`✓ Found ${description}`));
    return true;
  } else {
    console.log(chalk[critical ? 'red' : 'yellow'](`${critical ? '✗' : '⚠'} Missing ${description}`));
    if (critical) issues++;
    else warnings++;
    return false;
  }
}

// Check tailwind.config.js
const tailwindConfigExists = checkFileExists(PATHS.tailwindConfig, 'tailwind.config.js');
if (tailwindConfigExists) {
  try {
    const tailwindConfig = require(PATHS.tailwindConfig);
    console.log(chalk.yellow('Checking tailwind.config.js content paths...'));
    
    const contentPaths = tailwindConfig.content || [];
    if (contentPaths.length === 0) {
      console.log(chalk.red('✗ No content paths defined in tailwind.config.js'));
      console.log(chalk.yellow('  This means Tailwind doesn\'t know which files to scan for classes.'));
      issues++;
    } else {
      console.log(chalk.green('✓ Content paths defined:'));
      contentPaths.forEach(path => console.log(`  - ${path}`));
      
      // Check if content paths cover common directories
      const commonPaths = ['./src/pages', './src/components', './src/app'];
      const missingPaths = commonPaths.filter(commonPath => 
        !contentPaths.some(contentPath => contentPath.includes(commonPath))
      );
      
      if (missingPaths.length > 0) {
        console.log(chalk.yellow(`⚠ Some common directories might be missing from content paths: ${missingPaths.join(', ')}`));
        warnings++;
      }
    }
  } catch (error) {
    console.log(chalk.red(`✗ Error parsing tailwind.config.js: ${error.message}`));
    issues++;
  }
}

// Check postcss.config.js
const postcssConfigExists = checkFileExists(PATHS.postcssConfig, 'postcss.config.js');
if (postcssConfigExists) {
  try {
    const postcssConfig = require(PATHS.postcssConfig);
    console.log(chalk.yellow('Checking postcss.config.js plugins...'));
    
    const plugins = postcssConfig.plugins || {};
    if (!plugins.tailwindcss) {
      console.log(chalk.red('✗ tailwindcss plugin not found in postcss.config.js'));
      issues++;
    } else {
      console.log(chalk.green('✓ tailwindcss plugin found'));
    }
    
    if (!plugins.autoprefixer) {
      console.log(chalk.yellow('⚠ autoprefixer plugin not found in postcss.config.js'));
      warnings++;
    } else {
      console.log(chalk.green('✓ autoprefixer plugin found'));
    }
  } catch (error) {
    console.log(chalk.red(`✗ Error parsing postcss.config.js: ${error.message}`));
    issues++;
  }
}

// Check globals.css
const globalsExists = checkFileExists(PATHS.globals, 'globals.css');
if (globalsExists) {
  console.log(chalk.yellow('Checking globals.css for Tailwind directives...'));
  
  try {
    const globalsContent = fs.readFileSync(PATHS.globals, 'utf8');
    const hasTailwindBase = globalsContent.includes('@tailwind base');
    const hasTailwindComponents = globalsContent.includes('@tailwind components');
    const hasTailwindUtilities = globalsContent.includes('@tailwind utilities');
    
    if (!hasTailwindBase) {
      console.log(chalk.red('✗ Missing @tailwind base directive in globals.css'));
      issues++;
    } else {
      console.log(chalk.green('✓ Found @tailwind base directive'));
    }
    
    if (!hasTailwindComponents) {
      console.log(chalk.red('✗ Missing @tailwind components directive in globals.css'));
      issues++;
    } else {
      console.log(chalk.green('✓ Found @tailwind components directive'));
    }
    
    if (!hasTailwindUtilities) {
      console.log(chalk.red('✗ Missing @tailwind utilities directive in globals.css'));
      issues++;
    } else {
      console.log(chalk.green('✓ Found @tailwind utilities directive'));
    }
  } catch (error) {
    console.log(chalk.red(`✗ Error reading globals.css: ${error.message}`));
    issues++;
  }
}

// Check layout.tsx
const layoutExists = checkFileExists(PATHS.layout, 'layout.tsx');
if (layoutExists) {
  console.log(chalk.yellow('Checking layout.tsx for globals.css import...'));
  
  try {
    const layoutContent = fs.readFileSync(PATHS.layout, 'utf8');
    const hasGlobalsImport = layoutContent.includes("import './globals.css'") || 
                             layoutContent.includes('import "./globals.css"');
    
    if (!hasGlobalsImport) {
      console.log(chalk.red('✗ Missing globals.css import in layout.tsx'));
      console.log(chalk.yellow('  This is critical - Tailwind styles won\'t be loaded without it.'));
      issues++;
    } else {
      console.log(chalk.green('✓ Found globals.css import in layout.tsx'));
    }
  } catch (error) {
    console.log(chalk.red(`✗ Error reading layout.tsx: ${error.message}`));
    issues++;
  }
}

// Check package.json for dependencies
const packageJsonExists = checkFileExists(PATHS.packageJson, 'package.json');
if (packageJsonExists) {
  console.log(chalk.yellow('Checking for Tailwind dependencies...'));
  
  try {
    const packageJson = require(PATHS.packageJson);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = ['tailwindcss', 'postcss', 'autoprefixer'];
    const missingDeps = requiredDeps.filter(dep => !deps[dep]);
    
    if (missingDeps.length > 0) {
      console.log(chalk.red(`✗ Missing dependencies: ${missingDeps.join(', ')}`));
      issues++;
    } else {
      console.log(chalk.green('✓ All required dependencies are installed'));
      
      // Check versions
      console.log(chalk.yellow('Checking dependency versions...'));
      
      const tailwindVersion = deps.tailwindcss;
      if (tailwindVersion && tailwindVersion.startsWith('^3')) {
        console.log(chalk.green(`✓ Tailwind CSS version: ${tailwindVersion}`));
      } else {
        console.log(chalk.yellow(`⚠ Tailwind CSS version (${tailwindVersion}) might not be compatible with Next.js 13+`));
        warnings++;
      }
    }
  } catch (error) {
    console.log(chalk.red(`✗ Error reading package.json: ${error.message}`));
    issues++;
  }
}

// Final summary
console.log('\n' + chalk.blue('📊 Tailwind CSS Verification Summary'));
console.log(chalk.yellow(`Issues found: ${issues}`));
console.log(chalk.yellow(`Warnings found: ${warnings}`));

if (issues === 0 && warnings === 0) {
  console.log(chalk.green('\n✅ Tailwind CSS appears to be correctly configured!'));
  console.log('To verify it\'s working properly, visit:');
  console.log('- http://localhost:3000/dev/css-diagnostic');
  console.log('- http://localhost:3000/dev/tailwind-test');
} else if (issues === 0) {
  console.log(chalk.yellow('\n⚠️ Tailwind CSS configuration has warnings but should work.'));
  console.log('Consider addressing the warnings for optimal setup.');
  console.log('To verify it\'s working properly, visit:');
  console.log('- http://localhost:3000/dev/css-diagnostic');
  console.log('- http://localhost:3000/dev/tailwind-test');
} else {
  console.log(chalk.red('\n❌ Tailwind CSS configuration has issues that need to be fixed.'));
  console.log('Run the fix script to attempt automatic repairs:');
  console.log('npm run fix:tailwind');
}

// Exit with appropriate code
process.exit(issues > 0 ? 1 : 0);