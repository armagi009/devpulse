/**
 * GitHub API Types
 * Types for GitHub API responses and client interfaces
 */

export type PRState = 'open' | 'closed' | 'all';
export type IssueState = 'open' | 'closed' | 'all';

export interface Repository {
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
  description: string | null;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  topics: string[];
}

export interface RepositoryDetails extends Repository {
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
}

export interface Commit {
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
  } | null;
  committer: {
    id: number;
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
}

export interface CommitDetails extends Commit {
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  files: {
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
    status: string;
    patch?: string;
  }[];
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  user: {
    id: number;
    login: string;
    avatar_url: string;
  };
  state: PRState;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  draft: boolean;
}

export interface PRDetails extends PullRequest {
  body: string | null;
  requested_reviewers: {
    id: number;
    login: string;
    avatar_url: string;
  }[];
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  mergeable: boolean | null;
  mergeable_state: string;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  user: {
    id: number;
    login: string;
    avatar_url: string;
  };
  state: IssueState;
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

export interface IssueDetails extends Issue {
  body: string | null;
  assignees: {
    id: number;
    login: string;
    avatar_url: string;
  }[];
  comments: number;
}

export interface RateLimitStatus {
  resources: {
    core: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
    search: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
    graphql: {
      limit: number;
      used: number;
      remaining: number;
      reset: number;
    };
  };
  rate: {
    limit: number;
    used: number;
    remaining: number;
    reset: number;
  };
}

export interface GitHubAPIClient {
  // Repository operations
  getUserRepositories(): Promise<Repository[]>;
  getRepositoryDetails(repoId: string): Promise<RepositoryDetails>;
  
  // Commit operations
  getCommits(repoId: string, since?: Date): Promise<Commit[]>;
  getCommitDetails(repoId: string, sha: string): Promise<CommitDetails>;
  
  // PR operations
  getPullRequests(repoId: string, state?: PRState): Promise<PullRequest[]>;
  getPullRequestDetails(repoId: string, prNumber: number): Promise<PRDetails>;
  
  // Issue operations
  getIssues(repoId: string, state?: IssueState): Promise<Issue[]>;
  getIssueDetails(repoId: string, issueNumber: number): Promise<IssueDetails>;
  
  // Rate limiting
  getRateLimitStatus(): Promise<RateLimitStatus>;
}