# DevPulse Mock Mode Documentation

Welcome to the DevPulse Mock Mode documentation. This documentation provides comprehensive information about the mock authentication and test data features in DevPulse.

## Table of Contents

- [Setup Guide](./setup-guide.md): Instructions for setting up and configuring mock mode
- [Mock Users Guide](./mock-users.md): Information about available mock user profiles
- [Mock Data Structure Guide](./mock-data-structure.md): Details on the structure and patterns of mock data
- [Developer Guide](./developer-guide.md): Information for extending and customizing mock functionality

## Overview

DevPulse's mock mode allows you to develop and test the application without requiring real GitHub credentials or repositories. It provides:

- **Mock Authentication**: Simulates GitHub OAuth authentication without real credentials
- **Mock API Responses**: Provides realistic mock data for GitHub API calls
- **Configurable Test Data**: Generates realistic test data with configurable options
- **Development Tools**: Includes tools for managing and visualizing mock data

## Key Features

### Mock Authentication

- Sign in without real GitHub credentials
- Choose from predefined mock user profiles
- Switch between different mock users
- Simulate different user roles and behaviors

### Mock GitHub API

- Intercept GitHub API calls and return mock responses
- Simulate repositories, commits, pull requests, and issues
- Generate realistic data patterns based on user characteristics
- Simulate API rate limits and errors

### Mock Data Management

- View and manage mock data sets
- Reset mock data to its initial state
- Configure mock data generation options
- Import and export mock data sets

### Development Mode Indicator

- Visual indicator showing that mock mode is active
- Quick access to mock mode features
- Debug information and API call logging
- Toggle for switching between mock users

## Getting Started

To get started with mock mode, follow these steps:

1. Read the [Setup Guide](./setup-guide.md) for instructions on enabling mock mode
2. Explore the [Mock Users Guide](./mock-users.md) to learn about available mock user profiles
3. Check the [Mock Data Structure Guide](./mock-data-structure.md) for details on the mock data format
4. If you want to extend or customize mock functionality, refer to the [Developer Guide](./developer-guide.md)

## Contributing

If you want to contribute to the mock mode functionality, please follow these guidelines:

1. Read the [Developer Guide](./developer-guide.md) to understand the architecture and extension points
2. Follow the code style and organization conventions
3. Write tests for new functionality
4. Update documentation to reflect your changes
5. Submit a pull request with a clear description of your changes

## Support

If you encounter any issues or have questions about mock mode, please:

1. Check the documentation for solutions to common problems
2. Look for error messages in the browser console
3. Try the troubleshooting steps in the relevant guide
4. If the issue persists, contact the DevPulse development team