#!/usr/bin/env node

/**
 * Fix Auth Imports Script
 * Updates all imports of authOptions from route file to config file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all TypeScript and JavaScript files with the problematic import
function findFilesWithAuthImport() {
  try {
    const result = execSync(
      `grep -r "from '@/app/api/auth/\\[...nextauth\\]/route'" src/ --include="*.ts" --include="*.tsx" -l`,
      { encoding: 'utf8', cwd: process.cwd() }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    // No files found or grep error
    return [];
  }
}

// Fix the import in a single file
function fixImportInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
      /import\s*{\s*authOptions\s*}\s*from\s*['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route['"];?/g,
      "import { authOptions } from '@/lib/auth/auth-config';"
    );
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Finding files with problematic authOptions imports...');
  
  const files = findFilesWithAuthImport();
  
  if (files.length === 0) {
    console.log('✅ No files found with problematic imports!');
    return;
  }
  
  console.log(`📁 Found ${files.length} files to fix:`);
  files.forEach(file => console.log(`   - ${file}`));
  
  console.log('\n🔧 Fixing imports...');
  
  let fixedCount = 0;
  files.forEach(file => {
    if (fixImportInFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} out of ${files.length} files!`);
}

main();