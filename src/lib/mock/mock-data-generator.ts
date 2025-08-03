/**
 * Mock Data Generator
 * 
 * This module provides utilities for generating realistic mock data for GitHub repositories,
 * commits, pull requests, and issues. It creates data with patterns that mimic real-world
 * development activity, including different work patterns, burnout indicators, and team
 * collaboration patterns.
 * 
 * Implementation for Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6:
 * - Generate data that mimics real GitHub data patterns
 * - Include various patterns of activity (high, low, irregular)
 * - Create data that can trigger different burnout risk levels
 * - Create data that demonstrates different team collaboration patterns
 * - Allow configuring the time range of the data
 * - Allow configuring the number of repositories, users, and activity volume
 */

import { faker } from '@faker-js/faker';
import { 
  Repository, 
  Commit, 
  PullRequest, 
  Issue,
  PRState,
  IssueState
} from '../types/github';
import { MockData, MockDataOptions, MockUser } from '../types/mock';
import { getMockUsers, getMockUserById } from './mock-users';

/**
 * Generate complete mock data based on provided options
 * 
 * @param options Configuration options for mock data generation
 * @returns Complete mock data object
 */
export async function generateMockData(options: MockDataOptions): Promise<MockData> {
  // Generate repositories first
  const repositories = generateRepositories(options);
  
  // Generate data for each repository
  const commits: Record<string, Commit[]> = {};
  const pullRequests: Record<string, PullRequest[]> = {};
  const issues: Record<string, Issue[]> = {};
  
  for (const repo of repositories) {
    // Get repository full name to use as key
    const repoFullName = repo.full_name;
    
    // Generate commits for this repository
    commits[repoFullName] = generateCommits(repo, options);
    
    // Generate pull requests for this repository
    pullRequests[repoFullName] = generatePullRequests(repo, options);
    
    // Generate issues for this repository
    issues[repoFullName] = generateIssues(repo, options);
  }
  
  return {
    repositories,
    commits,
    pullRequests,
    issues
  };
}

/**
 * Generate mock repositories
 * 
 * @param options Configuration options for mock data generation
 * @returns Array of mock repositories
 */
export function generateRepositories(options: MockDataOptions): Repository[] {
  const repositories: Repository[] = [];
  const mockUsers = getMockUsers();
  
  // Generate the specified number of repositories
  for (let i = 0; i < options.repositories; i++) {
    // Select a random user as the repository owner
    const ownerIndex = faker.number.int({ min: 0, max: mockUsers.length - 1 });
    const owner = mockUsers[ownerIndex];
    
    // Generate repository name
    const repoName = generateRepositoryName();
    
    // Generate repository creation date (between 1-2 years ago)
    const createdAt = faker.date.past({ years: 2 });
    
    // Generate repository update date (between creation date and now)
    const updatedAt = faker.date.between({ 
      from: createdAt, 
      to: new Date() 
    });
    
    // Generate repository pushed date (between update date and now)
    const pushedAt = faker.date.between({ 
      from: updatedAt, 
      to: new Date() 
    });
    
    // Generate repository
    repositories.push({
      id: faker.number.int({ min: 100000, max: 999999 }),
      name: repoName,
      full_name: `${owner.login}/${repoName}`,
      owner: {
        id: owner.id,
        login: owner.login,
        avatar_url: owner.avatar_url
      },
      private: faker.datatype.boolean(),
      html_url: `https://github.com/${owner.login}/${repoName}`,
      description: faker.lorem.sentence(),
      default_branch: faker.helpers.arrayElement(['main', 'master']),
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      pushed_at: pushedAt.toISOString(),
      language: faker.helpers.arrayElement([
        'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 
        'Ruby', 'PHP', 'C#', 'C++', 'Rust', null
      ]),
      topics: generateRepositoryTopics()
    });
  }
  
  return repositories;
}

/**
 * Generate mock commits for a repository
 * 
 * @param repository Repository to generate commits for
 * @param options Configuration options for mock data generation
 * @returns Array of mock commits
 */
export function generateCommits(repository: Repository, options: MockDataOptions): Commit[] {
  const commits: Commit[] = [];
  const mockUsers = getMockUsers();
  
  // Determine the number of commits based on activity level
  let commitCount: number;
  switch (options.activityLevel) {
    case 'high':
      commitCount = faker.number.int({ min: 200, max: 500 });
      break;
    case 'medium':
      commitCount = faker.number.int({ min: 50, max: 200 });
      break;
    case 'low':
      commitCount = faker.number.int({ min: 10, max: 50 });
      break;
    default:
      commitCount = faker.number.int({ min: 50, max: 200 });
  }
  
  // Calculate the start date based on the time range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - options.timeRangeInDays);
  
  // Generate commits
  for (let i = 0; i < commitCount; i++) {
    // Select a random user as the commit author
    const authorIndex = faker.number.int({ min: 0, max: mockUsers.length - 1 });
    const author = mockUsers[authorIndex];
    
    // Generate commit date within the specified time range
    const commitDate = generateCommitDate(
      startDate, 
      new Date(), 
      author.workPattern,
      author.workHours
    );
    
    // Generate commit
    commits.push({
      sha: faker.git.commitSha(),
      commit: {
        author: {
          name: author.name,
          email: author.email,
          date: commitDate.toISOString()
        },
        committer: {
          name: author.name,
          email: author.email,
          date: commitDate.toISOString()
        },
        message: generateCommitMessage()
      },
      author: {
        id: author.id,
        login: author.login,
        avatar_url: author.avatar_url
      },
      committer: {
        id: author.id,
        login: author.login,
        avatar_url: author.avatar_url
      },
      html_url: `https://github.com/${repository.full_name}/commit/${faker.git.commitSha()}`
    });
  }
  
  // Sort commits by date (oldest first)
  commits.sort((a, b) => {
    return new Date(a.commit.author.date).getTime() - new Date(b.commit.author.date).getTime();
  });
  
  return commits;
}

/**
 * Generate mock pull requests for a repository
 * 
 * @param repository Repository to generate pull requests for
 * @param options Configuration options for mock data generation
 * @returns Array of mock pull requests
 */
export function generatePullRequests(repository: Repository, options: MockDataOptions): PullRequest[] {
  const pullRequests: PullRequest[] = [];
  const mockUsers = getMockUsers();
  
  // Determine the number of PRs based on activity level
  let prCount: number;
  switch (options.activityLevel) {
    case 'high':
      prCount = faker.number.int({ min: 50, max: 100 });
      break;
    case 'medium':
      prCount = faker.number.int({ min: 20, max: 50 });
      break;
    case 'low':
      prCount = faker.number.int({ min: 5, max: 20 });
      break;
    default:
      prCount = faker.number.int({ min: 20, max: 50 });
  }
  
  // Calculate the start date based on the time range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - options.timeRangeInDays);
  
  // Generate pull requests
  for (let i = 1; i <= prCount; i++) {
    // Select a random user as the PR author
    const authorIndex = faker.number.int({ min: 0, max: mockUsers.length - 1 });
    const author = mockUsers[authorIndex];
    
    // Generate PR creation date within the specified time range
    const createdAt = faker.date.between({ 
      from: startDate, 
      to: new Date() 
    });
    
    // Determine if PR is closed/merged
    const isClosed = faker.datatype.boolean(0.7); // 70% chance of being closed
    
    // Generate closed date if PR is closed
    let closedAt: string | null = null;
    let mergedAt: string | null = null;
    
    if (isClosed) {
      // Generate closed date after creation date
      const closedDate = faker.date.between({ 
        from: createdAt, 
        to: new Date() 
      });
      
      closedAt = closedDate.toISOString();
      
      // 80% of closed PRs are merged
      if (faker.datatype.boolean(0.8)) {
        mergedAt = closedDate.toISOString();
      }
    }
    
    // Determine PR state
    let state: PRState = 'open';
    if (closedAt) {
      state = mergedAt ? 'closed' : 'closed';
    }
    
    // Generate PR
    pullRequests.push({
      id: faker.number.int({ min: 100000, max: 999999 }),
      number: i,
      title: generatePullRequestTitle(),
      user: {
        id: author.id,
        login: author.login,
        avatar_url: author.avatar_url
      },
      state,
      created_at: createdAt.toISOString(),
      updated_at: faker.date.between({ 
        from: createdAt, 
        to: new Date() 
      }).toISOString(),
      closed_at: closedAt,
      merged_at: mergedAt,
      html_url: `https://github.com/${repository.full_name}/pull/${i}`,
      draft: faker.datatype.boolean(0.1) // 10% chance of being a draft
    });
  }
  
  // Sort pull requests by number (ascending)
  pullRequests.sort((a, b) => a.number - b.number);
  
  return pullRequests;
}

/**
 * Generate mock issues for a repository
 * 
 * @param repository Repository to generate issues for
 * @param options Configuration options for mock data generation
 * @returns Array of mock issues
 */
export function generateIssues(repository: Repository, options: MockDataOptions): Issue[] {
  const issues: Issue[] = [];
  const mockUsers = getMockUsers();
  
  // Determine the number of issues based on activity level
  let issueCount: number;
  switch (options.activityLevel) {
    case 'high':
      issueCount = faker.number.int({ min: 50, max: 150 });
      break;
    case 'medium':
      issueCount = faker.number.int({ min: 20, max: 50 });
      break;
    case 'low':
      issueCount = faker.number.int({ min: 5, max: 20 });
      break;
    default:
      issueCount = faker.number.int({ min: 20, max: 50 });
  }
  
  // Calculate the start date based on the time range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - options.timeRangeInDays);
  
  // Generate issues
  for (let i = 1; i <= issueCount; i++) {
    // Select a random user as the issue author
    const authorIndex = faker.number.int({ min: 0, max: mockUsers.length - 1 });
    const author = mockUsers[authorIndex];
    
    // Generate issue creation date within the specified time range
    const createdAt = faker.date.between({ 
      from: startDate, 
      to: new Date() 
    });
    
    // Determine if issue is closed
    const isClosed = faker.datatype.boolean(0.6); // 60% chance of being closed
    
    // Generate closed date if issue is closed
    let closedAt: string | null = null;
    
    if (isClosed) {
      // Generate closed date after creation date
      closedAt = faker.date.between({ 
        from: createdAt, 
        to: new Date() 
      }).toISOString();
    }
    
    // Determine issue state
    const state: IssueState = isClosed ? 'closed' : 'open';
    
    // Generate issue
    issues.push({
      id: faker.number.int({ min: 100000, max: 999999 }),
      number: i,
      title: generateIssueTitle(),
      user: {
        id: author.id,
        login: author.login,
        avatar_url: author.avatar_url
      },
      state,
      created_at: createdAt.toISOString(),
      updated_at: faker.date.between({ 
        from: createdAt, 
        to: new Date() 
      }).toISOString(),
      closed_at: closedAt,
      html_url: `https://github.com/${repository.full_name}/issues/${i}`,
      labels: generateIssueLabels()
    });
  }
  
  // Sort issues by number (ascending)
  issues.sort((a, b) => a.number - b.number);
  
  return issues;
}

/**
 * Generate user activity patterns based on user characteristics
 * 
 * @param user Mock user to generate activity for
 * @param startDate Start date for activity generation
 * @param endDate End date for activity generation
 * @returns Object containing activity metrics
 */
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
  const commitDates: Date[] = [];
  const prDates: Date[] = [];
  const reviewDates: Date[] = [];
  const issueDates: Date[] = [];
  
  // Determine activity frequency based on user's activity level
  let commitFrequency: number;
  let prFrequency: number;
  let reviewFrequency: number;
  let issueFrequency: number;
  
  switch (user.activityLevel) {
    case 'high':
      commitFrequency = faker.number.int({ min: 5, max: 15 }); // commits per week
      prFrequency = faker.number.int({ min: 3, max: 8 }); // PRs per week
      reviewFrequency = faker.number.int({ min: 5, max: 15 }); // reviews per week
      issueFrequency = faker.number.int({ min: 2, max: 5 }); // issues per week
      break;
    case 'medium':
      commitFrequency = faker.number.int({ min: 2, max: 7 }); // commits per week
      prFrequency = faker.number.int({ min: 1, max: 3 }); // PRs per week
      reviewFrequency = faker.number.int({ min: 2, max: 7 }); // reviews per week
      issueFrequency = faker.number.int({ min: 1, max: 3 }); // issues per week
      break;
    case 'low':
      commitFrequency = faker.number.int({ min: 0, max: 3 }); // commits per week
      prFrequency = faker.number.int({ min: 0, max: 1 }); // PRs per week
      reviewFrequency = faker.number.int({ min: 0, max: 3 }); // reviews per week
      issueFrequency = faker.number.int({ min: 0, max: 1 }); // issues per week
      break;
    default:
      commitFrequency = faker.number.int({ min: 2, max: 7 }); // commits per week
      prFrequency = faker.number.int({ min: 1, max: 3 }); // PRs per week
      reviewFrequency = faker.number.int({ min: 2, max: 7 }); // reviews per week
      issueFrequency = faker.number.int({ min: 1, max: 3 }); // issues per week
  }
  
  // Adjust frequencies based on work pattern
  if (user.workPattern === 'overworked') {
    commitFrequency *= 1.5;
    prFrequency *= 1.3;
    reviewFrequency *= 1.5;
    issueFrequency *= 1.2;
  } else if (user.workPattern === 'underutilized') {
    commitFrequency *= 0.5;
    prFrequency *= 0.7;
    reviewFrequency *= 0.5;
    issueFrequency *= 0.7;
  }
  
  // Generate activity dates
  const daysBetween = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeksCount = Math.ceil(daysBetween / 7);
  
  // Generate commit dates
  const totalCommits = Math.floor(commitFrequency * weeksCount);
  for (let i = 0; i < totalCommits; i++) {
    commitDates.push(generateCommitDate(startDate, endDate, user.workPattern, user.workHours));
  }
  
  // Generate PR dates
  const totalPRs = Math.floor(prFrequency * weeksCount);
  for (let i = 0; i < totalPRs; i++) {
    prDates.push(faker.date.between({ from: startDate, to: endDate }));
  }
  
  // Generate review dates
  const totalReviews = Math.floor(reviewFrequency * weeksCount);
  for (let i = 0; i < totalReviews; i++) {
    reviewDates.push(faker.date.between({ from: startDate, to: endDate }));
  }
  
  // Generate issue dates
  const totalIssues = Math.floor(issueFrequency * weeksCount);
  for (let i = 0; i < totalIssues; i++) {
    issueDates.push(faker.date.between({ from: startDate, to: endDate }));
  }
  
  return {
    commitDates,
    prDates,
    reviewDates,
    issueDates
  };
}

/**
 * Generate a commit date based on user work pattern and hours
 * 
 * @param startDate Start date range
 * @param endDate End date range
 * @param workPattern User's work pattern
 * @param workHours User's work hours
 * @returns Generated commit date
 */
function generateCommitDate(
  startDate: Date, 
  endDate: Date, 
  workPattern: MockUser['workPattern'],
  workHours: MockUser['workHours']
): Date {
  // Generate a random date within the range
  const date = faker.date.between({ from: startDate, to: endDate });
  
  // Adjust time based on work hours
  let hour: number;
  switch (workHours) {
    case 'early-morning':
      hour = faker.number.int({ min: 5, max: 9 });
      break;
    case 'standard':
      hour = faker.number.int({ min: 9, max: 17 });
      break;
    case 'late-night':
      hour = faker.number.int({ min: 18, max: 23 });
      break;
    case 'weekend':
      // Make sure it's a weekend (0 = Sunday, 6 = Saturday)
      while (date.getDay() !== 0 && date.getDay() !== 6) {
        date.setDate(date.getDate() + 1);
        if (date > endDate) {
          date.setDate(date.getDate() - 7); // Go back a week if we went past end date
        }
      }
      hour = faker.number.int({ min: 10, max: 20 });
      break;
    default:
      hour = faker.number.int({ min: 9, max: 17 });
  }
  
  // Adjust for work pattern
  if (workPattern === 'overworked') {
    // Higher chance of late night or weekend work
    if (faker.datatype.boolean(0.4)) {
      hour = faker.number.int({ min: 18, max: 23 });
      
      // 30% chance of weekend work
      if (faker.datatype.boolean(0.3)) {
        // Make it a weekend
        date.setDate(date.getDate() + (6 - date.getDay()));
      }
    }
  } else if (workPattern === 'irregular') {
    // Completely random hours
    hour = faker.number.int({ min: 0, max: 23 });
  }
  
  // Set the hour
  date.setHours(hour, faker.number.int({ min: 0, max: 59 }), 0, 0);
  
  return date;
}

/**
 * Generate a repository name
 * @returns Repository name
 */
function generateRepositoryName(): string {
  const prefixes = ['project', 'app', 'service', 'api', 'lib', 'tool', 'framework', 'sdk'];
  const suffixes = ['core', 'ui', 'server', 'client', 'web', 'mobile', 'data', 'utils', 'common'];
  
  if (faker.datatype.boolean(0.7)) {
    // 70% chance of prefix-name format
    return `${faker.helpers.arrayElement(prefixes)}-${faker.word.noun()}`;
  } else {
    // 30% chance of name-suffix format
    return `${faker.word.noun()}-${faker.helpers.arrayElement(suffixes)}`;
  }
}

/**
 * Generate repository topics
 * @returns Array of repository topics
 */
function generateRepositoryTopics(): string[] {
  const allTopics = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'express',
    'api', 'rest', 'graphql', 'database', 'sql', 'nosql', 'mongodb', 'postgresql',
    'frontend', 'backend', 'fullstack', 'web', 'mobile', 'desktop', 'cloud',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops', 'ci-cd',
    'testing', 'automation', 'machine-learning', 'ai', 'data-science',
    'security', 'performance', 'accessibility', 'responsive', 'pwa'
  ];
  
  const topicCount = faker.number.int({ min: 0, max: 5 });
  const topics: string[] = [];
  
  for (let i = 0; i < topicCount; i++) {
    const topic = faker.helpers.arrayElement(allTopics);
    if (!topics.includes(topic)) {
      topics.push(topic);
    }
  }
  
  return topics;
}

/**
 * Generate a commit message
 * @returns Commit message
 */
function generateCommitMessage(): string {
  const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
  const scopes = ['core', 'ui', 'api', 'auth', 'data', 'config', 'build', 'deps'];
  
  if (faker.datatype.boolean(0.7)) {
    // 70% chance of conventional commit format
    const type = faker.helpers.arrayElement(types);
    const hasScope = faker.datatype.boolean(0.6);
    const scope = hasScope ? `(${faker.helpers.arrayElement(scopes)})` : '';
    
    return `${type}${scope}: ${faker.lorem.sentence().replace(/\.$/, '')}`;
  } else {
    // 30% chance of regular message
    return faker.lorem.sentence().replace(/\.$/, '');
  }
}

/**
 * Generate a pull request title
 * @returns Pull request title
 */
function generatePullRequestTitle(): string {
  const prefixes = [
    'Add', 'Fix', 'Update', 'Improve', 'Refactor', 'Implement', 
    'Remove', 'Optimize', 'Simplify', 'Enhance'
  ];
  
  if (faker.datatype.boolean(0.8)) {
    // 80% chance of prefix format
    return `${faker.helpers.arrayElement(prefixes)} ${faker.lorem.words({ min: 2, max: 6 })}`;
  } else {
    // 20% chance of regular title
    return faker.lorem.sentence().replace(/\.$/, '');
  }
}

/**
 * Generate an issue title
 * @returns Issue title
 */
function generateIssueTitle(): string {
  const prefixes = [
    'Bug:', 'Feature:', 'Enhancement:', 'Documentation:', 'Performance:',
    'Fix', 'Add', 'Update', 'Improve', 'Document'
  ];
  
  if (faker.datatype.boolean(0.6)) {
    // 60% chance of prefix format
    return `${faker.helpers.arrayElement(prefixes)} ${faker.lorem.words({ min: 3, max: 8 })}`;
  } else {
    // 40% chance of regular title or question
    if (faker.datatype.boolean(0.3)) {
      return `${faker.lorem.sentence().replace(/\.$/, '?')}`;
    } else {
      return faker.lorem.sentence().replace(/\.$/, '');
    }
  }
}

/**
 * Generate issue labels
 * @returns Array of issue labels
 */
function generateIssueLabels(): { id: number; name: string; color: string }[] {
  const allLabels = [
    { name: 'bug', color: 'd73a4a' },
    { name: 'enhancement', color: 'a2eeef' },
    { name: 'documentation', color: '0075ca' },
    { name: 'help wanted', color: '008672' },
    { name: 'good first issue', color: '7057ff' },
    { name: 'invalid', color: 'e4e669' },
    { name: 'question', color: 'd876e3' },
    { name: 'wontfix', color: 'ffffff' },
    { name: 'duplicate', color: 'cfd3d7' },
    { name: 'feature', color: '0e8a16' },
    { name: 'performance', color: 'fbca04' },
    { name: 'refactoring', color: '1d76db' },
    { name: 'testing', color: 'c2e0c6' },
    { name: 'security', color: 'b60205' },
    { name: 'dependencies', color: '5319e7' }
  ];
  
  const labelCount = faker.number.int({ min: 0, max: 3 });
  const labels: { id: number; name: string; color: string }[] = [];
  
  for (let i = 0; i < labelCount; i++) {
    const label = faker.helpers.arrayElement(allLabels);
    if (!labels.some(l => l.name === label.name)) {
      labels.push({
        id: faker.number.int({ min: 1000, max: 9999 }),
        name: label.name,
        color: label.color
      });
    }
  }
  
  return labels;
}