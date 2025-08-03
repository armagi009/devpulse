/**
 * Tests for the mock data generator
 */

import { describe, it, expect } from 'vitest';
import { 
  generateMockData, 
  generateRepositories, 
  generateCommits, 
  generatePullRequests, 
  generateIssues,
  generateUserActivityPattern
} from '../mock-data-generator';
import { MockDataOptions } from '../../types/mock';
import { getMockUsers } from '../mock-users';

describe('Mock Data Generator', () => {
  const testOptions: MockDataOptions = {
    repositories: 2,
    usersPerRepo: 2,
    timeRangeInDays: 30,
    activityLevel: 'medium',
    burnoutPatterns: true,
    collaborationPatterns: true,
  };

  it('should generate repositories', () => {
    const repositories = generateRepositories(testOptions);
    
    expect(repositories).toHaveLength(testOptions.repositories);
    expect(repositories[0]).toHaveProperty('id');
    expect(repositories[0]).toHaveProperty('name');
    expect(repositories[0]).toHaveProperty('full_name');
    expect(repositories[0]).toHaveProperty('owner');
  });

  it('should generate commits for a repository', () => {
    const repositories = generateRepositories(testOptions);
    const commits = generateCommits(repositories[0], testOptions);
    
    expect(commits.length).toBeGreaterThan(0);
    expect(commits[0]).toHaveProperty('sha');
    expect(commits[0]).toHaveProperty('commit');
    expect(commits[0].commit).toHaveProperty('author');
    expect(commits[0].commit).toHaveProperty('message');
  });

  it('should generate pull requests for a repository', () => {
    const repositories = generateRepositories(testOptions);
    const pullRequests = generatePullRequests(repositories[0], testOptions);
    
    expect(pullRequests.length).toBeGreaterThan(0);
    expect(pullRequests[0]).toHaveProperty('id');
    expect(pullRequests[0]).toHaveProperty('number');
    expect(pullRequests[0]).toHaveProperty('title');
    expect(pullRequests[0]).toHaveProperty('user');
    expect(pullRequests[0]).toHaveProperty('state');
  });

  it('should generate issues for a repository', () => {
    const repositories = generateRepositories(testOptions);
    const issues = generateIssues(repositories[0], testOptions);
    
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toHaveProperty('id');
    expect(issues[0]).toHaveProperty('number');
    expect(issues[0]).toHaveProperty('title');
    expect(issues[0]).toHaveProperty('user');
    expect(issues[0]).toHaveProperty('state');
    expect(issues[0]).toHaveProperty('labels');
  });

  it('should generate user activity patterns', () => {
    const mockUsers = getMockUsers();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    
    const activityPattern = generateUserActivityPattern(mockUsers[0], startDate, endDate);
    
    expect(activityPattern).toHaveProperty('commitDates');
    expect(activityPattern).toHaveProperty('prDates');
    expect(activityPattern).toHaveProperty('reviewDates');
    expect(activityPattern).toHaveProperty('issueDates');
  });

  it('should generate complete mock data', async () => {
    const mockData = await generateMockData(testOptions);
    
    expect(mockData).toHaveProperty('repositories');
    expect(mockData).toHaveProperty('commits');
    expect(mockData).toHaveProperty('pullRequests');
    expect(mockData).toHaveProperty('issues');
    
    expect(mockData.repositories).toHaveLength(testOptions.repositories);
    
    // Check that we have commits, PRs, and issues for each repository
    for (const repo of mockData.repositories) {
      const repoFullName = repo.full_name;
      expect(mockData.commits[repoFullName]).toBeDefined();
      expect(mockData.pullRequests[repoFullName]).toBeDefined();
      expect(mockData.issues[repoFullName]).toBeDefined();
    }
  });

  it('should generate different activity levels', () => {
    // Test low activity
    const lowOptions = { ...testOptions, activityLevel: 'low' as const };
    const lowRepos = generateRepositories(lowOptions);
    const lowCommits = generateCommits(lowRepos[0], lowOptions);
    
    // Test high activity
    const highOptions = { ...testOptions, activityLevel: 'high' as const };
    const highRepos = generateRepositories(highOptions);
    const highCommits = generateCommits(highRepos[0], highOptions);
    
    // High activity should generally have more commits than low activity
    // This is a probabilistic test, but should pass most of the time
    expect(highCommits.length).toBeGreaterThan(lowCommits.length);
  });
});