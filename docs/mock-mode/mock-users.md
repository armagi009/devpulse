# Mock Users Guide

This guide provides information about the mock user profiles available in DevPulse's mock mode.

## Overview

DevPulse's mock mode includes a set of predefined user profiles with different characteristics. These profiles are designed to simulate various developer behaviors and work patterns, allowing you to test different scenarios and edge cases.

## Available Mock Users

The following mock users are available in the system:

| ID | Username | Name | Role | Work Pattern | Activity Level |
|----|----------|------|------|-------------|----------------|
| 1001 | regular-dev | Alex Johnson | developer | regular | medium |
| 1002 | overworked-lead | Sam Taylor | team-lead | overworked | high |
| 1003 | night-coder | Jamie Rivera | developer | irregular | high |
| 1004 | balanced-dev | Morgan Chen | developer | regular | medium |
| 1005 | weekend-warrior | Casey Kim | contributor | irregular | medium |
| 1006 | early-bird | Robin Patel | developer | regular | high |
| 1007 | manager-user | Jordan Smith | manager | regular | low |
| 1008 | burnout-risk | Taylor Rodriguez | developer | overworked | high |
| 1009 | underutilized-dev | Riley Garcia | developer | underutilized | low |
| 1010 | new-hire | Quinn Wilson | developer | regular | medium |

## User Characteristics

### Roles

- **developer**: Regular development team member
- **team-lead**: Team leader or senior developer
- **manager**: Project or team manager
- **contributor**: External or part-time contributor

### Work Patterns

- **regular**: Consistent work during standard hours
- **irregular**: Inconsistent work hours and patterns
- **overworked**: Working excessive hours or taking on too much work
- **underutilized**: Not working to full capacity

### Activity Levels

- **high**: High frequency of commits, pull requests, and other activities
- **medium**: Moderate frequency of activities
- **low**: Low frequency of activities

### Collaboration Styles

- **team-player**: Works well with others, frequent collaboration
- **independent**: Prefers to work alone, less collaboration
- **mentor**: Helps others, reviews code, provides guidance

### Response Times

- **fast**: Quick to respond to issues, pull requests, etc.
- **average**: Typical response time
- **slow**: Delayed responses

### Work Hours

- **standard**: Works during typical business hours
- **late-night**: Works primarily in the evening or at night
- **early-morning**: Works primarily in the early morning
- **weekend**: Works primarily on weekends

## User Profiles in Detail

### Regular Developer (Alex Johnson)

A typical developer with a balanced work pattern and medium activity level. Works during standard hours and collaborates well with the team.

### Overworked Team Lead (Sam Taylor)

A team lead with a high workload and activity level. Works late hours and responds quickly to issues and pull requests. Shows signs of potential burnout.

### Night Coder (Jamie Rivera)

A developer who works primarily at night with an irregular schedule. High activity level but slower response times due to working outside of standard hours.

### Balanced Developer (Morgan Chen)

A well-balanced developer with regular work hours and medium activity. Good at documentation and testing.

### Weekend Warrior (Casey Kim)

A contributor who works primarily on weekends. Medium activity level with irregular patterns focused on weekends.

### Early Bird (Robin Patel)

A developer who starts work early in the morning. High activity level with a focus on UI/UX and accessibility.

### Manager (Jordan Smith)

A manager with regular work hours but low direct coding activity. Focuses on project management and planning.

### Burnout Risk (Taylor Rodriguez)

A developer showing clear signs of burnout with overworked patterns, late-night work, and high activity levels.

### Underutilized Developer (Riley Garcia)

A developer with low activity levels and standard work hours. Not working to full capacity.

### New Hire (Quinn Wilson)

A recently hired developer with regular work hours and medium activity level. Focuses on learning and small tasks.

## Using Mock Users

### Selecting a Mock User

When mock authentication is enabled, you can select a mock user in two ways:

1. **During Sign In**: When you click "Sign In with GitHub", you'll be redirected to a mock user selection page.

2. **From the Dev Mode Indicator**: Click on the development mode indicator in the bottom-right corner, then click "Switch Mock User".

### Switching Between Users

You can switch between mock users at any time:

1. Click on the development mode indicator in the bottom-right corner
2. Click "Switch Mock User"
3. Select a different user from the list

### User Data Persistence

User selections are persisted in the browser's local storage. If you close and reopen the application, you'll still be signed in as the same mock user.

## Extending Mock Users

If you need to add or modify mock users, you can do so by editing the `mockUsers` array in `src/lib/mock/mock-users.ts`:

```typescript
export const mockUsers: MockUser[] = [
  // Existing users...
  
  // Add a new user
  {
    id: 1011,
    login: 'your-new-user',
    name: 'Your New User',
    email: 'your.new.user@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1011',
    html_url: 'https://github.com/your-new-user',
    role: 'developer',
    workPattern: 'regular',
    activityLevel: 'medium',
    collaborationStyle: 'team-player',
    responseTime: 'average',
    workHours: 'standard',
    specialties: ['your-specialty']
  },
];
```

## Next Steps

- Return to the [Setup Guide](./setup-guide.md) for general mock mode configuration
- Explore the [Mock Data Structure Guide](./mock-data-structure.md) for details on the mock data format
- Check the [Developer Guide](./developer-guide.md) for information on extending mock functionality