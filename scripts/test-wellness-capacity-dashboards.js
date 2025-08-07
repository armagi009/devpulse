#!/usr/bin/env node

/**
 * Wellness & Capacity Dashboards Test Runner
 * Comprehensive testing script for the wellness and capacity dashboard implementation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const testConfig = {
  // Unit tests for dashboard pages
  dashboardTests: [
    'src/app/dashboard/wellness/__tests__/page.test.tsx',
    'src/app/dashboard/capacity/__tests__/page.test.tsx'
  ],
  
  // Component tests
  componentTests: [
    'src/components/layout/__tests__/Header.test.tsx'
  ],
  
  // Data adapter tests
  adapterTests: [
    'src/lib/adapters/__tests__/wellness-data-adapter.test.ts',
    'src/lib/adapters/__tests__/capacity-data-adapter.test.ts'
  ],
  
  // API integration tests
  apiTests: [
    'src/app/api/analytics/__tests__/burnout-integration.test.ts'
  ],
  
  // E2E tests (if they exist)
  e2eTests: [
    'e2e-tests/tests/wellness-dashboard.spec.ts',
    'e2e-tests/tests/capacity-dashboard.spec.ts'
  ]
};

// Test categories with descriptions
const testCategories = [
  {
    name: 'Dashboard Pages',
    tests: testConfig.dashboardTests,
    description: 'Testing wellness and capacity dashboard page components'
  },
  {
    name: 'Header Navigation',
    tests: testConfig.componentTests,
    description: 'Testing role-based navigation and wellness/capacity links'
  },
  {
    name: 'Data Adapters',
    tests: testConfig.adapterTests,
    description: 'Testing data mapping and integration adapters'
  },
  {
    name: 'API Integration',
    tests: testConfig.apiTests,
    description: 'Testing API endpoints used by dashboards'
  }
];

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(message, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSubHeader(message) {
  log('\n' + '-'.repeat(40), 'blue');
  log(message, 'bright');
  log('-'.repeat(40), 'blue');
}

function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr || ''
    };
  }
}

async function runCommandAsync(command, args = [], options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });

    let output = '';
    if (options.silent) {
      child.stdout?.on('data', (data) => {
        output += data.toString();
      });
      child.stderr?.on('data', (data) => {
        output += data.toString();
      });
    }

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        code,
        output
      });
    });
  });
}

// Test validation functions
function validateTestEnvironment() {
  logSubHeader('Validating Test Environment');
  
  const requiredFiles = [
    'package.json',
    'jest.config.js',
    'jest.setup.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !checkFileExists(file));
  
  if (missingFiles.length > 0) {
    log(`❌ Missing required files: ${missingFiles.join(', ')}`, 'red');
    return false;
  }
  
  // Check if Jest is installed
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasJest = packageJson.devDependencies?.jest || packageJson.dependencies?.jest;
  
  if (!hasJest) {
    log('❌ Jest is not installed', 'red');
    return false;
  }
  
  log('✅ Test environment is properly configured', 'green');
  return true;
}

function validateTestFiles() {
  logSubHeader('Validating Test Files');
  
  let allFilesExist = true;
  
  testCategories.forEach(category => {
    log(`\nChecking ${category.name}:`, 'yellow');
    
    category.tests.forEach(testFile => {
      if (checkFileExists(testFile)) {
        log(`  ✅ ${testFile}`, 'green');
      } else {
        log(`  ❌ ${testFile} (missing)`, 'red');
        allFilesExist = false;
      }
    });
  });
  
  return allFilesExist;
}

// Test execution functions
async function runUnitTests() {
  logSubHeader('Running Unit Tests');
  
  const testFiles = [
    ...testConfig.dashboardTests,
    ...testConfig.componentTests,
    ...testConfig.adapterTests
  ].filter(checkFileExists);
  
  if (testFiles.length === 0) {
    log('❌ No unit test files found', 'red');
    return false;
  }
  
  const result = await runCommandAsync('npm', ['test', '--', '--testPathPattern=__tests__', '--verbose'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Unit tests passed', 'green');
    return true;
  } else {
    log('❌ Unit tests failed', 'red');
    return false;
  }
}

async function runIntegrationTests() {
  logSubHeader('Running Integration Tests');
  
  const testFiles = testConfig.apiTests.filter(checkFileExists);
  
  if (testFiles.length === 0) {
    log('❌ No integration test files found', 'red');
    return false;
  }
  
  const result = await runCommandAsync('npm', ['test', '--', '--testPathPattern=integration', '--verbose'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Integration tests passed', 'green');
    return true;
  } else {
    log('❌ Integration tests failed', 'red');
    return false;
  }
}

async function runE2ETests() {
  logSubHeader('Running E2E Tests');
  
  // Check if Playwright is configured
  if (!checkFileExists('playwright.config.ts') && !checkFileExists('e2e-tests/playwright.config.ts')) {
    log('⚠️  Playwright not configured, skipping E2E tests', 'yellow');
    return true;
  }
  
  const testFiles = testConfig.e2eTests.filter(checkFileExists);
  
  if (testFiles.length === 0) {
    log('⚠️  No E2E test files found, skipping', 'yellow');
    return true;
  }
  
  // Try to run Playwright tests
  const result = await runCommandAsync('npx', ['playwright', 'test', '--project=chromium'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ E2E tests passed', 'green');
    return true;
  } else {
    log('❌ E2E tests failed', 'red');
    return false;
  }
}

// Dashboard-specific validation functions
async function validateDashboardAccessibility() {
  logSubHeader('Validating Dashboard Accessibility');
  
  // Check if accessibility testing tools are available
  const hasAxe = runCommand('npm list @axe-core/react', { silent: true }).success;
  
  if (!hasAxe) {
    log('⚠️  @axe-core/react not installed, skipping accessibility tests', 'yellow');
    return true;
  }
  
  // Run accessibility tests
  const result = await runCommandAsync('npm', ['test', '--', '--testNamePattern=accessibility', '--verbose'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Accessibility tests passed', 'green');
    return true;
  } else {
    log('❌ Accessibility tests failed', 'red');
    return false;
  }
}

async function validateResponsiveDesign() {
  logSubHeader('Validating Responsive Design');
  
  // Check if responsive design tests exist
  const responsiveTestPattern = /responsive|mobile|tablet/i;
  const hasResponsiveTests = testConfig.dashboardTests.some(testFile => {
    if (!checkFileExists(testFile)) return false;
    
    const content = fs.readFileSync(testFile, 'utf8');
    return responsiveTestPattern.test(content);
  });
  
  if (!hasResponsiveTests) {
    log('⚠️  No responsive design tests found', 'yellow');
    return true;
  }
  
  const result = await runCommandAsync('npm', ['test', '--', '--testNamePattern=responsive', '--verbose'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Responsive design tests passed', 'green');
    return true;
  } else {
    log('❌ Responsive design tests failed', 'red');
    return false;
  }
}

async function validateRoleBasedAccess() {
  logSubHeader('Validating Role-Based Access Control');
  
  // Run tests specifically for role-based functionality
  const result = await runCommandAsync('npm', ['test', '--', '--testNamePattern=role|permission|auth', '--verbose'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Role-based access tests passed', 'green');
    return true;
  } else {
    log('❌ Role-based access tests failed', 'red');
    return false;
  }
}

async function validateDataIntegration() {
  logSubHeader('Validating Data Integration');
  
  // Run adapter and API tests
  const adapterFiles = testConfig.adapterTests.filter(checkFileExists);
  const apiFiles = testConfig.apiTests.filter(checkFileExists);
  
  if (adapterFiles.length === 0 && apiFiles.length === 0) {
    log('❌ No data integration tests found', 'red');
    return false;
  }
  
  const result = await runCommandAsync('npm', ['test', '--', '--testPathPattern=adapter|api', '--verbose'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Data integration tests passed', 'green');
    return true;
  } else {
    log('❌ Data integration tests failed', 'red');
    return false;
  }
}

// Performance testing
async function validatePerformance() {
  logSubHeader('Validating Performance');
  
  // Check if performance tests exist
  const performanceTestPattern = /performance|speed|load/i;
  const hasPerformanceTests = [...testConfig.dashboardTests, ...testConfig.apiTests].some(testFile => {
    if (!checkFileExists(testFile)) return false;
    
    const content = fs.readFileSync(testFile, 'utf8');
    return performanceTestPattern.test(content);
  });
  
  if (!hasPerformanceTests) {
    log('⚠️  No performance tests found', 'yellow');
    return true;
  }
  
  const result = await runCommandAsync('npm', ['test', '--', '--testNamePattern=performance', '--verbose'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Performance tests passed', 'green');
    return true;
  } else {
    log('❌ Performance tests failed', 'red');
    return false;
  }
}

// Test coverage analysis
async function generateTestCoverage() {
  logSubHeader('Generating Test Coverage Report');
  
  const result = await runCommandAsync('npm', ['test', '--', '--coverage', '--coverageDirectory=coverage/wellness-capacity'], {
    silent: false
  });
  
  if (result.success) {
    log('✅ Test coverage report generated', 'green');
    log('📊 Coverage report available at: coverage/wellness-capacity/lcov-report/index.html', 'cyan');
    return true;
  } else {
    log('❌ Failed to generate test coverage report', 'red');
    return false;
  }
}

// Main test execution
async function runAllTests() {
  logHeader('Wellness & Capacity Dashboards - Comprehensive Testing');
  
  const results = {
    environment: false,
    files: false,
    unit: false,
    integration: false,
    e2e: false,
    accessibility: false,
    responsive: false,
    roleAccess: false,
    dataIntegration: false,
    performance: false,
    coverage: false
  };
  
  try {
    // Validation phase
    results.environment = validateTestEnvironment();
    if (!results.environment) {
      log('\n❌ Test environment validation failed. Please fix the issues above.', 'red');
      process.exit(1);
    }
    
    results.files = validateTestFiles();
    if (!results.files) {
      log('\n⚠️  Some test files are missing. Tests will run for available files only.', 'yellow');
    }
    
    // Core testing phase
    results.unit = await runUnitTests();
    results.integration = await runIntegrationTests();
    results.e2e = await runE2ETests();
    
    // Specialized testing phase
    results.accessibility = await validateDashboardAccessibility();
    results.responsive = await validateResponsiveDesign();
    results.roleAccess = await validateRoleBasedAccess();
    results.dataIntegration = await validateDataIntegration();
    results.performance = await validatePerformance();
    
    // Coverage analysis
    results.coverage = await generateTestCoverage();
    
  } catch (error) {
    log(`\n❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Summary report
  logHeader('Test Results Summary');
  
  const testResults = [
    { name: 'Environment Setup', result: results.environment },
    { name: 'Test Files', result: results.files },
    { name: 'Unit Tests', result: results.unit },
    { name: 'Integration Tests', result: results.integration },
    { name: 'E2E Tests', result: results.e2e },
    { name: 'Accessibility', result: results.accessibility },
    { name: 'Responsive Design', result: results.responsive },
    { name: 'Role-Based Access', result: results.roleAccess },
    { name: 'Data Integration', result: results.dataIntegration },
    { name: 'Performance', result: results.performance },
    { name: 'Test Coverage', result: results.coverage }
  ];
  
  testResults.forEach(({ name, result }) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`${status} ${name}`, color);
  });
  
  const passedTests = testResults.filter(t => t.result).length;
  const totalTests = testResults.length;
  
  log(`\n📊 Overall Results: ${passedTests}/${totalTests} test categories passed`, 
    passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! The wellness and capacity dashboards are ready for deployment.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the results above and fix any issues.', 'yellow');
    process.exit(1);
  }
}

// CLI argument handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('Wellness & Capacity Dashboards Test Runner', 'bright');
  log('\nUsage: node scripts/test-wellness-capacity-dashboards.js [options]', 'cyan');
  log('\nOptions:', 'bright');
  log('  --unit-only        Run only unit tests');
  log('  --integration-only Run only integration tests');
  log('  --e2e-only         Run only E2E tests');
  log('  --coverage         Generate test coverage report');
  log('  --help, -h         Show this help message');
  process.exit(0);
}

// Run specific test types based on arguments
if (args.includes('--unit-only')) {
  runUnitTests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--integration-only')) {
  runIntegrationTests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--e2e-only')) {
  runE2ETests().then(success => process.exit(success ? 0 : 1));
} else if (args.includes('--coverage')) {
  generateTestCoverage().then(success => process.exit(success ? 0 : 1));
} else {
  // Run all tests
  runAllTests();
}