# Mock Module

This module contains mock implementations for development and testing purposes.

## Components

- `mock-users.ts`: Mock user profiles and utilities
- `mock-data-store.ts`: Storage for mock data
- `mock-data-mapper.ts`: Utilities for mapping between GitHub API and internal formats
- `mock-data-generator.ts`: Utilities for generating mock data (to be implemented)
- `mock-errors.ts`: Error simulation for testing error handling (to be implemented)

## Mock Data Models

The mock data system uses the following models:

### MockData

The core interface for storing mock GitHub data:

```typescript
interface MockData {
  repositories: Repository[];
  commits: Record<string, Commit[]>; // Key is repository full name
  pullRequests: Record<string, PullRequest[]>; // Key is repository full name
  issues: Record<string, Issue[]>; // Key is repository full name
}
```

### MockDataSet

The database model for storing mock data sets:

```prisma
model MockDataSet {
  id        String   @id @default(uuid())
  name      String   @unique
  data      String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### MockDataOptions

Options for generating mock data:

```typescript
interface MockDataOptions {
  repositories: number;
  usersPerRepo: number;
  timeRangeInDays: number;
  activityLevel: 'low' | 'medium' | 'high';
  burnoutPatterns: boolean;
  collaborationPatterns: boolean;
}
```

## Mock Data Store

The mock data store provides functionality for managing mock data persistence, loading, and resetting. It interacts with the database to store and retrieve mock data sets.

### Features

- **Persistence**: Mock data is stored in the database using the `MockDataSet` model
- **Loading**: Retrieve mock data from the database or create empty data if it doesn't exist
- **Resetting**: Delete existing mock data and optionally create new data
- **Import/Export**: Import and export mock data as JSON strings
- **Listing**: List all available mock data sets

### Usage

```typescript
import { getMockData, resetMockData, importMockData, exportMockData } from '../mock/mock-data-store';

// Get mock data (creates empty data if it doesn't exist)
const mockData = await getMockData('default');

// Reset mock data to empty state
await resetMockData('default');

// Export mock data as JSON
const jsonData = await exportMockData('default');

// Import mock data from JSON
await importMockData('new-dataset', jsonData);

// List all available mock data sets
const dataSets = await listMockDataSets();
```

## Mock Data Mapper

The mock data mapper provides utilities for converting between GitHub API format and our internal mock data structure.

### Features

- **Format Conversion**: Convert between GitHub API format and internal format
- **Data Transformation**: Transform entire mock data structures

### Usage

```typescript
import { 
  mapToGitHubRepository, 
  mapToGitHubCommit, 
  convertMockDataToGitHubFormat 
} from '../mock/mock-data-mapper';

// Convert a single repository
const githubRepo = mapToGitHubRepository(internalRepo);

// Convert a single commit
const githubCommit = mapToGitHubCommit(internalCommit);

// Convert entire mock data structure
const githubFormat = convertMockDataToGitHubFormat(mockData);
```