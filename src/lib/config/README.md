# Development Mode Configuration

This module provides configuration and utilities for managing the application's development mode, including mock authentication and API responses.

## Environment Variables

The following environment variables control the development mode:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_USE_MOCK_AUTH` | Whether to use mock authentication instead of real GitHub OAuth | `false` |
| `NEXT_PUBLIC_USE_MOCK_API` | Whether to use mock API responses instead of real GitHub API calls | `false` |
| `NEXT_PUBLIC_MOCK_DATA_SET` | The name of the mock data set to use | `default` |
| `NEXT_PUBLIC_SHOW_DEV_MODE_INDICATOR` | Whether to show a visual indicator that the app is in development mode | `true` |
| `NEXT_PUBLIC_LOG_MOCK_CALLS` | Whether to log mock API calls for debugging | `true` |
| `NEXT_PUBLIC_MOCK_ERROR_SIMULATION` | Whether to simulate errors in mock API calls | `false` |
| `NEXT_PUBLIC_MOCK_ERROR_PROBABILITY` | Probability of an error occurring (0-1) | `0.1` |
| `NEXT_PUBLIC_MOCK_ERROR_TYPES` | Comma-separated list of error types to simulate | `RATE_LIMIT_EXCEEDED,NETWORK_ERROR,SERVER_ERROR` |
| `NEXT_PUBLIC_MOCK_ERROR_MIN_DELAY` | Minimum delay in ms for simulated timeouts | `500` |
| `NEXT_PUBLIC_MOCK_ERROR_MAX_DELAY` | Maximum delay in ms for simulated timeouts | `3000` |

## Usage

### Checking if Development Mode is Active

```typescript
import { isDevMode } from '../config/dev-mode';

if (isDevMode()) {
  // Do something specific to development mode
}
```

### Getting Development Mode Configuration

```typescript
import { getDevModeConfig } from '../config/dev-mode';

const config = getDevModeConfig();
if (config.useMockAuth) {
  // Use mock authentication
}
```

### Validating Development Mode Configuration

```typescript
import { validateDevModeConfig } from '../config/dev-mode';

const errors = validateDevModeConfig();
if (errors.length > 0) {
  console.warn('Development mode configuration warnings:', errors);
}
```

## Best Practices

1. Always use the `isDevMode()` function to check if development mode is active, rather than checking individual configuration values.
2. In production code, wrap development mode-specific code in conditional checks to ensure it doesn't run in production.
3. Be aware that mock authentication and mock API should typically be enabled or disabled together to avoid inconsistent behavior.
4. When using error simulation, start with a low probability (e.g., 0.1) to avoid excessive errors.
5. Use the mock data management UI to configure and reset mock data rather than modifying it directly.

## Documentation

For more detailed information about the mock mode, see the [Mock Mode Documentation](../../../docs/mock-mode/README.md).