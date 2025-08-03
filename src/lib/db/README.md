# Database Schema Adapter

This directory contains the database schema adapter layer, which helps handle schema differences between different versions of the application.

## Overview

The schema adapter layer provides a set of utilities for working with the database in a way that's resilient to schema changes. It ensures that code can work with both the original schema and enhanced schemas with additional relations.

## Key Components

- `schema-adapter.ts`: Contains adapter functions for safely accessing database models and relations
- `init-schema-adapter.ts`: Initializes the schema adapter and checks for schema compatibility
- `prisma.ts`: Exports the Prisma client instance

## Usage

Instead of directly using the Prisma client for operations that might be affected by schema differences, use the adapter functions:

```typescript
import { getRepository, getRetrospective, hasPermission } from '@/lib/db/schema-adapter';

// Safely get a repository
const repository = await getRepository(repositoryId);

// Safely check permissions
const canAccess = await hasPermission(userId, 'view:team_metrics', DEFAULT_ROLE_PERMISSIONS);
```

## Schema Compatibility

The schema adapter handles the following potential schema differences:

1. Missing relations between models (e.g., Retrospective -> Repository)
2. Missing models (e.g., AppMode, TeamMember)
3. Missing fields on models (e.g., User.role, User.permissions)

When a schema feature is missing, the adapter provides appropriate fallbacks:

- For missing relations: Fetch related entities separately
- For missing models: Return empty arrays or default values
- For missing fields: Use environment variables or defaults

## Environment Variables

The schema adapter uses the following environment variables for fallbacks:

- `NEXT_PUBLIC_USE_MOCK_AUTH`: When true, assumes all permissions are granted
- `NEXT_PUBLIC_USE_MOCK_API`: When true, uses mock API responses
- `NEXT_PUBLIC_MOCK_DATA_SET`: Specifies the mock data set to use

## Troubleshooting

If you encounter database-related errors, try running the schema compatibility check:

```bash
node scripts/ensure-schema-compatibility.js
```

This will check if your database schema is compatible with the code and provide guidance on any issues found.