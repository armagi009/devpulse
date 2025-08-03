// Simple script to initialize the database
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Initializing database...');

// Check if .env file exists
if (!fs.existsSync(path.resolve(__dirname, '..', '.env'))) {
  console.log('No .env file found. Creating from template...');
  try {
    fs.copyFileSync(
      path.resolve(__dirname, '..', '.env.example'),
      path.resolve(__dirname, '..', '.env')
    );
    console.log('Created .env file from .env.example');
  } catch (error) {
    console.error('Failed to create .env file:', error.message);
    console.log('Please create a .env file manually based on .env.example');
  }
}

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
  
  // Push schema to database (this is safer than running migrations for initial setup)
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
  
  console.log('Database initialization complete!');
} catch (error) {
  console.error('Error initializing database:', error.message);
  console.error('Make sure your PostgreSQL database is running and accessible with the credentials in your .env file.');
  process.exit(1);
}