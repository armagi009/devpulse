# DevPulse End-to-End Tests

This directory contains end-to-end tests for the DevPulse application using Playwright.

## Test Structure

The tests are organized into the following categories:

1. **Authentication Flow Tests** (`auth-flow.spec.ts`)
   - Tests for sign-in page
   - Mock authentication flow
   - User session management
   - Sign out functionality
   - Onboarding flow for new users

2. **Dashboard Loading Tests** (`dashboard-loading.spec.ts`)
   - Initial loading states
   - Data rendering
   - Performance metrics
   - Error handling
   - Navigation between dashboard sections
   - Data filtering

3. **Mobile Responsiveness Tests** (`mobile-responsiveness.spec.ts`)
   - Mobile navigation menu
   - Responsive layout adaptation
   - Touch interactions
   - Mobile-optimized controls
   - Progressive disclosure
   - Mobile data visualizations
   - Network optimization

## Running the Tests

### Prerequisites

1. Install dependencies:
   ```
   npm install
   ```

2. Install Playwright browsers:
   ```
   npx playwright install
   ```

### Running All Tests

```
npm run test:e2e
```

### Running Tests with UI Mode

```
npm run test:e2e:ui
```

### Running Tests in Debug Mode

```
npm run test:e2e:debug
```

### Running Specific Test Files

```
npx playwright test --config=e2e-tests/playwright.config.ts auth-flow.spec.ts
```

## Test Configuration

The test configuration is defined in `playwright.config.ts`. Key configurations include:

- **Browsers**: Tests run on Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari
- **Viewport Sizes**: Tests run on desktop and mobile viewports
- **Screenshots**: Captured on test failure
- **Traces**: Captured on first retry
- **Base URL**: http://localhost:3000
- **Web Server**: Starts the Next.js development server before running tests

## Requirements Coverage

These tests cover the following requirements:

- **Requirement 1.1-1.5**: Authentication flow tests
- **Requirement 4.3, 4.5**: Dashboard loading and chart rendering tests
- **Requirement 7.1, 7.2**: Performance and API response time tests
- **Requirement 10.1-10.6**: Mobile responsiveness tests

## Continuous Integration

These tests can be run in CI environments by setting the `CI` environment variable:

```
CI=true npm run test:e2e
```

In CI environments, tests will be retried up to 2 times on failure.