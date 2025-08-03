# Mock Data Structure Guide

This guide provides detailed information about the structure and patterns of the mock data used in DevPulse's mock mode.

## Overview

DevPulse's mock data is designed to mimic real GitHub data, including repositories, commits, pull requests, and issues. The data is structured to simulate various development patterns and scenarios, allowing you to test different features and edge cases.

## Data Structure

The mock data is organized into the following main components:

```typescript
interface MockData {
  repositories: Repository[];
  commits: Record<string, Commit[]>; // Key is repository full name
  pullRequests: Record<string, PullRequest[]>; // Key is repository full name
  issues: Record<string, Issue[]>; // Key is repository full name
}
```

### Repositories

Repositories represent GitHub repositories with properties like name, owner, description, and language.

```typescript
interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    id: number;
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  description: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  topics: string[];
}
```

### Commits

Commits represent Git commits with properties like author, message, and timestamp.

```typescript
interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    id: number;
    login: string;
    avatar_url: string;
  };
  committer: {
    id: number;
    login: string;
    avatar_url: string;
  };
  html_url: string;
}
```

### Pull Requests

Pull requests represent GitHub pull requests with properties like title, state, and author.

```typescript
interface PullRequest {
  id: number;
  number: number;
  title: string;
  user: {
    id: number;
    login: string;
    avatar_url: string;
  };
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  draft: boolean;
}
```

### Issues

Issues represent GitHub issues with properties like title, state, and author.

```typescript
interface Issue {
  id: number;
  number: number;
  title: string;
  user: {
    id: number;
    login: string;
    avatar_url: string;
  };
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
}
```

## Data Patterns

The mock data generator creates data with various patterns to simulate real-world development scenarios:

### Activity Patterns

- **Regular Activity**: Consistent commits and pull requests during standard work hours
- **Irregular Activity**: Inconsistent commits and pull requests at various times
- **Overworked Activity**: High frequency of commits and pull requests, often outside standard hours
- **Underutilized Activity**: Low frequency of commits and pull requests

### Burnout Patterns

When burnout patterns are enabled, the mock data includes:

- Late-night commits and activity
- Weekend work
- Inconsistent work patterns
- High frequency of commits followed by periods of inactivity
- Declining code quality indicators

### Collaboration Patterns

When collaboration patterns are enabled, the mock data includes:

- Pull request reviews and comments
- Issue assignments and comments
- Cross-repository contributions
- Team-based work patterns

## Data Generation Options

When generating mock data, you can configure the following options:

| Option | Description | Default |
|--------|-------------|---------|
| `repositories` | Number of repositories to generate | 5 |
| `usersPerRepo` | Number of users contributing to each repository | 3 |
| `timeRangeInDays` | Time range for generated data in days | 90 |
| `activityLevel` | Overall activity level (low, medium, high) | medium |
| `burnoutPatterns` | Whether to include burnout patterns | true |
| `collaborationPatterns` | Whether to include collaboration patterns | true |

## Data Storage

Mock data is stored in the database as JSON strings in the `MockDataSet` table:

```prisma
model MockDataSet {
  id        String   @id @default(uuid())
  name      String   @unique
  data      String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Managing Mock Data

You can manage mock data through:

1. **Mock Data Management UI**: Navigate to `/dev/mock-data` to view, reset, configure, import, and export mock data sets.

2. **API Functions**: Use the functions in `src/lib/mock/mock-data-store.ts`:
   - `getMockData(dataSet?: string, options?: MockDataOptions)`: Get mock data from the database or generate new data
   - `resetMockData(dataSet?: string, options?: MockDataOptions)`: Reset mock data by deleting existing data and generating new data
   - `exportMockData(dataSet?: string)`: Export mock data as a JSON string
   - `importMockData(dataSet: string, jsonData: string)`: Import mock data from a JSON string

## Customizing Mock Data

### Adding Custom Data

To add custom data to the mock data generator, you can modify the generator functions in `src/lib/mock/mock-data-generator.ts`.

For example, to add custom repository topics:

```typescript
function generateRepositoryTopics(): string[] {
  const allTopics = [
    // Existing topics...
    'javascript', 'typescript', 'react',
    
    // Add your custom topics
    'your-custom-topic', 'another-topic',
  ];
  
  // Rest of the function...
}
```

### Creating Custom Data Patterns

To create custom data patterns, you can modify the `generateUserActivityPattern` function in `src/lib/mock/mock-data-generator.ts`:

```typescript
export function generateUserActivityPattern(
  user: MockUser, 
  startDate: Date, 
  endDate: Date
): {
  commitDates: Date[];
  prDates: Date[];
  reviewDates: Date[];
  issueDates: Date[];
} {
  // Existing code...
  
  // Add your custom pattern logic
  if (user.specialties.includes('your-specialty')) {
    // Generate custom pattern
  }
  
  // Rest of the function...
}
```

## Next Steps

- Return to the [Setup Guide](./setup-guide.md) for general mock mode configuration
- Explore the [Mock Users Guide](./mock-users.md) to learn about available mock user profiles
- Check the [Developer Guide](./developer-guide.md) for information on extending mock functionality