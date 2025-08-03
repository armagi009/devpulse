/**
 * Test GitHub API Client
 * Simple script to test the GitHub API client
 */

import { getGitHubApiClient, RequestPriority } from './github-api-client';

/**
 * Test GitHub API client
 */
async function testGitHubApiClient(accessToken: string) {
  try {
    console.log('Testing GitHub API client...');
    
    // Get GitHub API client
    const githubClient = getGitHubApiClient();
    
    // Set access token
    githubClient.setAccessToken(accessToken);
    
    // Get rate limit status
    console.log('Getting rate limit status...');
    const rateLimitStatus = await githubClient.getRateLimitStatus();
    console.log('Rate limit status:', JSON.stringify(rateLimitStatus, null, 2));
    
    // Get user repositories
    console.log('Getting user repositories...');
    const repositories = await githubClient.getUserRepositories();
    console.log(`Found ${repositories.length} repositories`);
    
    if (repositories.length > 0) {
      // Get repository details
      const repo = repositories[0];
      console.log(`Getting details for repository: ${repo.full_name}`);
      const repoDetails = await githubClient.getRepositoryDetails(repo.full_name);
      console.log('Repository details:', JSON.stringify(repoDetails, null, 2));
      
      // Get commits
      console.log(`Getting commits for repository: ${repo.full_name}`);
      const commits = await githubClient.getCommits(repo.full_name);
      console.log(`Found ${commits.length} commits`);
      
      if (commits.length > 0) {
        // Get commit details
        const commit = commits[0];
        console.log(`Getting details for commit: ${commit.sha}`);
        const commitDetails = await githubClient.getCommitDetails(repo.full_name, commit.sha);
        console.log('Commit details:', JSON.stringify(commitDetails, null, 2));
      }
      
      // Get pull requests
      console.log(`Getting pull requests for repository: ${repo.full_name}`);
      const pullRequests = await githubClient.getPullRequests(repo.full_name);
      console.log(`Found ${pullRequests.length} pull requests`);
      
      // Get issues
      console.log(`Getting issues for repository: ${repo.full_name}`);
      const issues = await githubClient.getIssues(repo.full_name);
      console.log(`Found ${issues.length} issues`);
    }
    
    console.log('GitHub API client test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error testing GitHub API client:', error);
    return false;
  }
}

// Execute the test if this file is run directly
if (require.main === module) {
  // Check if access token is provided
  const accessToken = process.argv[2];
  
  if (!accessToken) {
    console.error('Please provide a GitHub access token as an argument');
    process.exit(1);
  }
  
  testGitHubApiClient(accessToken)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export default testGitHubApiClient;