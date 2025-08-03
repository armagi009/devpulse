/**
 * Setup Mock API
 * 
 * This script copies all mock API files to their proper locations
 * to enable mock API responses in development mode.
 */

const fs = require('fs');
const path = require('path');

// Define the source and destination directories
const sourceDir = path.join(__dirname, '..', 'src', 'app', 'api');
const destDir = path.join(__dirname, '..', 'src', 'app', 'api');

/**
 * Copy a mock file to its destination
 * @param {string} sourcePath - Path to the mock file
 * @param {string} destPath - Path to the destination file
 */
function copyMockFile(sourcePath, destPath) {
  try {
    // Read the mock file
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    // Create the destination directory if it doesn't exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Write the content to the destination file
    fs.writeFileSync(destPath, content);
    
    console.log(`Copied ${sourcePath} to ${destPath}`);
  } catch (error) {
    console.error(`Error copying ${sourcePath} to ${destPath}:`, error);
  }
}

/**
 * Find all mock API files and copy them to their proper locations
 * @param {string} dir - Directory to search for mock files
 */
function findAndCopyMockFiles(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const sourcePath = path.join(dir, file);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        // Recursively search subdirectories
        findAndCopyMockFiles(sourcePath);
      } else if (file.endsWith('.mock.ts') || file.endsWith('.mock.js')) {
        // Found a mock file, copy it to the destination
        const destPath = sourcePath.replace('.mock', '');
        copyMockFile(sourcePath, destPath);
      }
    }
  } catch (error) {
    console.error(`Error searching directory ${dir}:`, error);
  }
}

// Start the process
console.log('Setting up mock API...');
findAndCopyMockFiles(sourceDir);
console.log('Mock API setup complete!');