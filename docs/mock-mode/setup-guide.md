# Mock Mode Setup Guide

This guide provides instructions for setting up and configuring the mock mode in DevPulse for development and testing purposes.

## Overview

DevPulse's mock mode allows you to develop and test the application without requiring real GitHub credentials or repositories. It provides mock authentication that simulates GitHub OAuth and mock API responses that mimic GitHub API data.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A local development environment for DevPulse

## Environment Configuration

To enable mock mode, you need to configure the following environment variables in your `.env` file:

```bash
# Mock Mode Configuration
NEXT_PUBLIC_USE_MOCK_AUTH=true
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_MOCK_DATA_SET=default
NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR=true
NEXT_PUBLIC_LOG_MOCK_CALLS=true

# Optional Error Simulation
NEXT_PUBLIC_MOCK_ERROR_SIMULATION=false
NEXT_PUBLIC_MOCK_ERROR_PROBABILITY=0.1
NEXT_PUBLIC_MOCK_ERROR_TYPES=RATE_LIMIT_EXCEEDED,NETWORK_ERROR,SERVER_ERROR
NEXT_PUBLIC_MOCK_ERROR_MIN_DELAY=500
NEXT_PUBLIC_MOCK_ERROR_MAX_DELAY=3000
```

### Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_USE_MOCK_AUTH` | Enable mock authentication | `false` |
| `NEXT_PUBLIC_USE_MOCK_API` | Enable mock API responses | `false` |
| `NEXT_PUBLIC_MOCK_DATA_SET` | Name of the mock data set to use | `default` |
| `NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR` | Show the development mode indicator | `true` |
| `NEXT_PUBLIC_LOG_MOCK_CALLS` | Log mock API calls to the console | `true` |
| `NEXT_PUBLIC_MOCK_ERROR_SIMULATION` | Enable error simulation | `false` |
| `NEXT_PUBLIC_MOCK_ERROR_PROBABILITY` | Probability of an error occurring (0-1) | `0.1` |
| `NEXT_PUBLIC_MOCK_ERROR_TYPES` | Comma-separated list of error types to simulate | `RATE_LIMIT_EXCEEDED,NETWORK_ERROR,SERVER_ERROR` |
| `NEXT_PUBLIC_MOCK_ERROR_MIN_DELAY` | Minimum delay in ms for simulated timeouts | `500` |
| `NEXT_PUBLIC_MOCK_ERROR_MAX_DELAY` | Maximum delay in ms for simulated timeouts | `3000` |

## Getting Started

1. Clone the DevPulse repository:
   ```bash
   git clone https://github.com/your-org/devpulse.git
   cd devpulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the mock mode configuration:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file to enable mock mode:
   ```bash
   NEXT_PUBLIC_USE_MOCK_AUTH=true
   NEXT_PUBLIC_USE_MOCK_API=true
   ```

5. Initialize the database:
   ```bash
   npm run db:init
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Verifying Mock Mode

When mock mode is enabled, you should see:

1. A development mode indicator in the bottom-right corner of the application
2. The ability to sign in without GitHub credentials
3. A mock user selection screen when signing in
4. Mock data throughout the application

## Managing Mock Data

DevPulse provides a UI for managing mock data. To access it:

1. Click on the development mode indicator in the bottom-right corner
2. Click on "Manage Mock Data" in the info tab
3. Alternatively, navigate directly to `/dev/mock-data`

In the mock data management UI, you can:

- View available mock data sets
- Preview mock data
- Reset mock data
- Configure mock data generation options
- Import and export mock data sets

## Troubleshooting

### Mock Mode Not Working

If mock mode is not working as expected:

1. Verify that the environment variables are set correctly
2. Check the browser console for any errors
3. Restart the development server
4. Clear your browser cache and cookies

### Database Issues

If you encounter database issues:

1. Reset the database:
   ```bash
   npm run db:reset
   ```

2. Reinitialize the database:
   ```bash
   npm run db:init
   ```

### Mock Data Issues

If mock data is not appearing or is incorrect:

1. Reset the mock data using the mock data management UI
2. Check the browser console for any errors
3. Verify that both mock authentication and mock API are enabled

## Next Steps

- Explore the [Mock Users Guide](./mock-users.md) to learn about available mock user profiles
- Read the [Mock Data Structure Guide](./mock-data-structure.md) for details on the mock data format
- Check the [Developer Guide](./developer-guide.md) for information on extending mock functionality