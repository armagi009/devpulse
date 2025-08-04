#!/usr/bin/env node

/**
 * Fix Vercel Import Issues
 * 
 * This script fixes module resolution issues in Vercel builds by ensuring
 * all required files exist and path mappings work correctly.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`💡 ${message}`, 'cyan');
}

function header(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function createMissingFile(filePath, content) {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content);
  success(`Created missing file: ${filePath}`);
}

async function fixVercelImports() {
  header('FIXING VERCEL IMPORT ISSUES');

  // Check and fix missing files that are causing import errors
  const requiredFiles = [
    {
      path: 'src/components/ui/DashboardCard.tsx',
      content: `// DashboardCard component
import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ title, children, className = '' }: DashboardCardProps) {
  return (
    <div className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
`
    },
    {
      path: 'src/lib/mock/mock-users.ts',
      content: `// Mock users for development
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'DEVELOPER',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'TEAM_LEAD',
    avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4'
  }
];

export function getMockUsers(): MockUser[] {
  return mockUsers;
}

export function getMockUserById(id: string): MockUser | undefined {
  return mockUsers.find(user => user.id === id);
}
`
    },
    {
      path: 'src/lib/config/dev-mode.ts',
      content: `// Development mode configuration
export interface DevModeConfig {
  useMockAuth: boolean;
  useMockApi: boolean;
  useMockData: boolean;
}

export function getDevModeConfig(): DevModeConfig {
  return {
    useMockAuth: process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true',
    useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
  };
}

export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isMockModeEnabled(): boolean {
  const config = getDevModeConfig();
  return config.useMockAuth || config.useMockApi || config.useMockData;
}
`
    },
    {
      path: 'src/components/layout/DashboardLayout.tsx',
      content: `// Dashboard layout component
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export default function DashboardLayout({ children, sidebar, header }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {header && (
        <header className="bg-white shadow-sm border-b">
          {header}
        </header>
      )}
      <div className="flex">
        {sidebar && (
          <aside className="w-64 bg-white shadow-sm min-h-screen">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
`
    }
  ];

  let filesCreated = 0;
  let filesExisted = 0;

  for (const file of requiredFiles) {
    if (checkFileExists(file.path)) {
      success(`File exists: ${file.path}`);
      filesExisted++;
    } else {
      createMissingFile(file.path, file.content);
      filesCreated++;
    }
  }

  // Update Next.js config to ensure proper module resolution
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Ensure webpack config includes proper alias resolution
    if (!nextConfig.includes('webpack:')) {
      const webpackConfig = `
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure proper module resolution for @ alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },`;
      
      // Insert webpack config before module.exports
      nextConfig = nextConfig.replace(
        'module.exports = nextConfig;',
        `${webpackConfig}\n};\n\nmodule.exports = nextConfig;`
      );
      
      // Add path import at the top
      if (!nextConfig.includes('const path = require')) {
        nextConfig = `const path = require('path');\n\n${nextConfig}`;
      }
      
      fs.writeFileSync(nextConfigPath, nextConfig);
      success('Updated next.config.js with webpack alias resolution');
    }
  }

  // Update tsconfig.json to ensure proper path resolution
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Ensure baseUrl is set
    if (!tsconfig.compilerOptions.baseUrl) {
      tsconfig.compilerOptions.baseUrl = '.';
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      success('Updated tsconfig.json with baseUrl');
    }
  }

  header('IMPORT FIX SUMMARY');

  log(`\n📊 File Status:`, 'blue');
  log(`✅ Files that existed: ${filesExisted}`);
  log(`🆕 Files created: ${filesCreated}`);
  
  if (filesCreated > 0) {
    log(`\n📋 Next steps:`, 'yellow');
    log('1. Commit the new files: git add .');
    log('2. Push to trigger new deployment: git push');
    log('3. Monitor Vercel build logs');
  } else {
    log(`\n💡 All required files exist. The issue might be:`, 'cyan');
    log('1. Vercel build cache - try clearing it');
    log('2. TypeScript path resolution in build environment');
    log('3. Check Vercel build logs for specific error details');
  }

  success('\n🎯 Import fixes applied!');
}

// Run the fix
if (require.main === module) {
  fixVercelImports();
}

module.exports = { fixVercelImports };