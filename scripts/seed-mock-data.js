#!/usr/bin/env node

/**
 * Mock Data Seeding Script
 * 
 * This script seeds the database with mock data for development and testing.
 * It uses the existing mock data generation system to create realistic data.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock data generation options
const MOCK_DATA_OPTIONS = {
  repositories: 5,
  usersPerRepo: 4,
  timeRangeInDays: 90,
  activityLevel: 'medium',
  burnoutPatterns: true,
  collaborationPatterns: true,
};

// Predefined scenarios
const SCENARIOS = {
  'healthy-team': {
    repositories: 3,
    usersPerRepo: 5,
    timeRangeInDays: 90,
    activityLevel: 'medium',
    burnoutPatterns: false,
    collaborationPatterns: true,
  },
  'burnout-risk': {
    repositories: 4,
    usersPerRepo: 6,
    timeRangeInDays: 90,
    activityLevel: 'high',
    burnoutPatterns: true,
    collaborationPatterns: true,
  },
  'high-velocity': {
    repositories: 6,
    usersPerRepo: 4,
    timeRangeInDays: 60,
    activityLevel: 'high',
    burnoutPatterns: false,
    collaborationPatterns: true,
  },
};

async function seedMockData(scenario = 'default') {
  try {
    console.log(`🌱 Seeding mock data for scenario: ${scenario}`);
    
    // Get options for the scenario
    const options = SCENARIOS[scenario] || MOCK_DATA_OPTIONS;
    
    // Check if mock data already exists
    const existingData = await prisma.mockDataSet.findUnique({
      where: { name: scenario },
    });
    
    if (existingData) {
      console.log(`📦 Mock data set '${scenario}' already exists. Skipping...`);
      console.log('💡 Use --force flag to regenerate existing data');
      return;
    }
    
    // Generate mock data structure
    const mockData = {
      repositories: generateMockRepositories(options),
      commits: {},
      pullRequests: {},
      issues: {}
    };
    
    // Generate data for each repository
    mockData.repositories.forEach(repo => {
      mockData.commits[repo.full_name] = generateMockCommits(repo, options);
      mockData.pullRequests[repo.full_name] = generateMockPullRequests(repo, options);
      mockData.issues[repo.full_name] = generateMockIssues(repo, options);
    });
    
    // Store in database
    await prisma.mockDataSet.create({
      data: {
        name: scenario,
        data: JSON.stringify(mockData),
      },
    });
    
    console.log(`✅ Successfully seeded mock data for scenario: ${scenario}`);
    console.log(`📊 Generated: ${mockData.repositories.length} repositories`);
    console.log(`📝 Generated: ${Object.values(mockData.commits).flat().length} commits`);
    console.log(`🔄 Generated: ${Object.values(mockData.pullRequests).flat().length} pull requests`);
    console.log(`🐛 Generated: ${Object.values(mockData.issues).flat().length} issues`);
    
  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    process.exit(1);
  }
}

// Simple mock data generators (simplified versions)
function generateMockRepositories(options) {
  const repos = [];
  const owners = ['alice', 'bob', 'charlie', 'diana'];
  
  for (let i = 0; i < options.repositories; i++) {
    const owner = owners[i % owners.length];
    const repoNames = ['frontend-app', 'backend-api', 'mobile-app', 'data-service', 'auth-service', 'ui-components'];
    const name = repoNames[i % repoNames.length];
    
    repos.push({
      id: 100000 + i,
      name,
      full_name: `${owner}/${name}`,
      owner: {
        id: 1000 + (i % owners.length),
        login: owner,
        avatar_url: `https://github.com/${owner}.png`
      },
      private: Math.random() > 0.7,
      html_url: `https://github.com/${owner}/${name}`,
      description: `A sample ${name} repository for demonstration`,
      default_branch: 'main',
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      pushed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      language: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go'][Math.floor(Math.random() * 5)],
      topics: ['web', 'api', 'frontend', 'backend'].slice(0, Math.floor(Math.random() * 3) + 1)
    });
  }
  
  return repos;
}

function generateMockCommits(repo, options) {
  const commits = [];
  const commitCount = Math.floor(Math.random() * 50) + 20; // 20-70 commits
  const startDate = new Date(Date.now() - options.timeRangeInDays * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < commitCount; i++) {
    const commitDate = new Date(startDate.getTime() + Math.random() * options.timeRangeInDays * 24 * 60 * 60 * 1000);
    
    commits.push({
      sha: Math.random().toString(36).substring(2, 15),
      commit: {
        author: {
          name: repo.owner.login,
          email: `${repo.owner.login}@example.com`,
          date: commitDate.toISOString()
        },
        committer: {
          name: repo.owner.login,
          email: `${repo.owner.login}@example.com`,
          date: commitDate.toISOString()
        },
        message: generateCommitMessage()
      },
      author: repo.owner,
      committer: repo.owner,
      html_url: `${repo.html_url}/commit/${Math.random().toString(36).substring(2, 15)}`
    });
  }
  
  return commits.sort((a, b) => new Date(a.commit.author.date) - new Date(b.commit.author.date));
}

function generateMockPullRequests(repo, options) {
  const prs = [];
  const prCount = Math.floor(Math.random() * 20) + 5; // 5-25 PRs
  
  for (let i = 1; i <= prCount; i++) {
    const createdAt = new Date(Date.now() - Math.random() * options.timeRangeInDays * 24 * 60 * 60 * 1000);
    const isClosed = Math.random() > 0.3;
    const closedAt = isClosed ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null;
    
    prs.push({
      id: 200000 + i,
      number: i,
      title: generatePRTitle(),
      user: repo.owner,
      state: isClosed ? 'closed' : 'open',
      created_at: createdAt.toISOString(),
      updated_at: (closedAt || createdAt).toISOString(),
      closed_at: closedAt?.toISOString() || null,
      merged_at: (isClosed && Math.random() > 0.2) ? closedAt?.toISOString() || null : null,
      html_url: `${repo.html_url}/pull/${i}`,
      draft: Math.random() > 0.9
    });
  }
  
  return prs;
}

function generateMockIssues(repo, options) {
  const issues = [];
  const issueCount = Math.floor(Math.random() * 30) + 10; // 10-40 issues
  
  for (let i = 1; i <= issueCount; i++) {
    const createdAt = new Date(Date.now() - Math.random() * options.timeRangeInDays * 24 * 60 * 60 * 1000);
    const isClosed = Math.random() > 0.4;
    const closedAt = isClosed ? new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null;
    
    issues.push({
      id: 300000 + i,
      number: i,
      title: generateIssueTitle(),
      user: repo.owner,
      state: isClosed ? 'closed' : 'open',
      created_at: createdAt.toISOString(),
      updated_at: (closedAt || createdAt).toISOString(),
      closed_at: closedAt?.toISOString() || null,
      html_url: `${repo.html_url}/issues/${i}`,
      labels: generateIssueLabels()
    });
  }
  
  return issues;
}

function generateCommitMessage() {
  const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
  const messages = [
    'update user interface',
    'fix authentication bug',
    'add new feature',
    'improve performance',
    'update documentation',
    'refactor code structure',
    'add unit tests',
    'fix styling issues'
  ];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  return `${type}: ${message}`;
}

function generatePRTitle() {
  const prefixes = ['Add', 'Fix', 'Update', 'Improve', 'Refactor', 'Remove'];
  const subjects = [
    'user authentication',
    'dashboard layout',
    'API endpoints',
    'error handling',
    'test coverage',
    'documentation'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  
  return `${prefix} ${subject}`;
}

function generateIssueTitle() {
  const types = ['Bug:', 'Feature:', 'Enhancement:', 'Question:'];
  const issues = [
    'Login page not responsive',
    'Add dark mode support',
    'Improve loading performance',
    'How to configure authentication?',
    'Dashboard charts not loading',
    'Add export functionality'
  ];
  
  if (Math.random() > 0.5) {
    const type = types[Math.floor(Math.random() * types.length)];
    const issue = issues[Math.floor(Math.random() * issues.length)];
    return `${type} ${issue}`;
  }
  
  return issues[Math.floor(Math.random() * issues.length)];
}

function generateIssueLabels() {
  const allLabels = [
    { id: 1, name: 'bug', color: 'd73a4a' },
    { id: 2, name: 'enhancement', color: 'a2eeef' },
    { id: 3, name: 'documentation', color: '0075ca' },
    { id: 4, name: 'good first issue', color: '7057ff' },
    { id: 5, name: 'help wanted', color: '008672' }
  ];
  
  const labelCount = Math.floor(Math.random() * 3);
  const labels = [];
  
  for (let i = 0; i < labelCount; i++) {
    const label = allLabels[Math.floor(Math.random() * allLabels.length)];
    if (!labels.find(l => l.id === label.id)) {
      labels.push(label);
    }
  }
  
  return labels;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const scenario = args.find(arg => !arg.startsWith('--')) || 'default';
  const force = args.includes('--force');
  
  if (force) {
    console.log('🔄 Force flag detected. Removing existing data...');
    await prisma.mockDataSet.deleteMany({
      where: { name: scenario }
    });
  }
  
  await seedMockData(scenario);
  
  console.log('\n🎉 Mock data seeding completed!');
  console.log('\n💡 Available scenarios:');
  Object.keys(SCENARIOS).forEach(key => {
    console.log(`   - ${key}`);
  });
  console.log('\n📖 Usage: node scripts/seed-mock-data.js [scenario] [--force]');
  
  await prisma.$disconnect();
}

// Handle errors
main().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});