#!/usr/bin/env node

/**
 * Fix BrowserInfo Script
 * Adds missing viewport property to browserInfo objects
 */

const fs = require('fs');
const path = require('path');

const filePath = 'e2e-tests/comprehensive-test-runner.ts';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all browserInfo objects that are missing viewport
  const regex = /browserInfo:\s*{\s*name:\s*'node',\s*version:\s*process\.version,\s*platform:\s*process\.platform\s*}/g;
  
  const replacement = `browserInfo: {
          name: 'node',
          version: process.version,
          platform: process.platform,
          viewport: { width: 1920, height: 1080 }
        }`;
  
  const updatedContent = content.replace(regex, replacement);
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log('✅ Fixed browserInfo objects in comprehensive-test-runner.ts');
  } else {
    console.log('ℹ️ No browserInfo objects needed fixing');
  }
} catch (error) {
  console.error('❌ Error fixing browserInfo:', error.message);
}