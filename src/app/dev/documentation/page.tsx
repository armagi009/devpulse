'use client';

import React from 'react';
import { 
  DocProvider, 
  DocumentationBrowser, 
  DocLink,
  DocCategory,
  DocArticle
} from '../../../components/help/DocumentationBrowser';

// Sample documentation data
const docCategories: DocCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of DevPulse and how to set up your workspace'
  },
  {
    id: 'features',
    title: 'Features',
    description: 'Explore the key features of DevPulse'
  },
  {
    id: 'metrics',
    title: 'Metrics & Analytics',
    description: 'Understand the metrics and analytics provided by DevPulse'
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Find solutions to common issues'
  }
];

const docArticles: DocArticle[] = [
  {
    id: 'welcome-guide',
    title: 'Welcome to DevPulse',
    categoryId: 'getting-started',
    tags: ['introduction', 'overview'],
    lastUpdated: 'July 15, 2025',
    content: (
      <div>
        <p className="mb-4">
          Welcome to DevPulse, the comprehensive developer analytics platform designed to help teams
          monitor performance, identify bottlenecks, and improve productivity.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">What is DevPulse?</h2>
        <p className="mb-4">
          DevPulse is a developer analytics platform that provides insights into your team's
          performance and helps you make data-driven decisions to improve productivity and
          prevent burnout.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Key Features</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Real-time metrics and analytics for development teams</li>
          <li>Burnout detection and prevention</li>
          <li>Code quality and productivity insights</li>
          <li>Team collaboration analysis</li>
          <li>Customizable dashboards and reports</li>
        </ul>
      </div>
    ),
    relatedArticles: ['setup-guide', 'dashboard-overview']
  },
  {
    id: 'setup-guide',
    title: 'Setting Up Your Workspace',
    categoryId: 'getting-started',
    tags: ['setup', 'configuration'],
    lastUpdated: 'July 18, 2025',
    content: (
      <div>
        <p className="mb-4">
          This guide will walk you through the process of setting up your DevPulse workspace
          and configuring it for your team's needs.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Prerequisites</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>A valid DevPulse account</li>
          <li>Admin access to your organization's GitHub or GitLab repositories</li>
          <li>Team member information (emails)</li>
        </ul>
      </div>
    ),
    relatedArticles: ['welcome-guide', 'repository-integration']
  },
  {
    id: 'productivity-metrics',
    title: 'Understanding Productivity Metrics',
    categoryId: 'metrics',
    tags: ['metrics', 'productivity', 'analytics'],
    lastUpdated: 'July 22, 2025',
    content: (
      <div>
        <p className="mb-4">
          DevPulse provides a comprehensive set of productivity metrics to help you understand
          your team's performance and identify areas for improvement.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Key Productivity Metrics</h2>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Code Velocity</strong>: Measures the rate at which code is being produced,
            taking into account the complexity and quality of the code.
          </li>
          <li>
            <strong>Pull Request Throughput</strong>: Tracks the number of pull requests created,
            reviewed, and merged over time.
          </li>
          <li>
            <strong>Cycle Time</strong>: Measures the time it takes for code to go from initial
            commit to production deployment.
          </li>
        </ul>
      </div>
    ),
    relatedArticles: ['burnout-detection']
  },
  {
    id: 'common-issues',
    title: 'Troubleshooting Common Issues',
    categoryId: 'troubleshooting',
    tags: ['troubleshooting', 'errors', 'support'],
    lastUpdated: 'August 1, 2025',
    content: (
      <div>
        <p className="mb-4">
          This guide addresses common issues that users may encounter when using DevPulse
          and provides solutions to resolve them.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Repository Sync Issues</h2>
        <div className="mb-4">
          <h3 className="font-medium">Symptom: Repository data is not updating</h3>
          <p className="mt-1">Possible solutions:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Check your integration permissions</li>
            <li>Verify that the repository is still connected</li>
            <li>Try manually triggering a sync</li>
          </ul>
        </div>
      </div>
    ),
    relatedArticles: []
  }
];

export default function DocumentationDemo() {
  return (
    <div className="h-screen flex flex-col">
      <DocProvider initialCategories={docCategories} initialArticles={docArticles}>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold mb-6">Documentation Browser Demo</h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Documentation Links</h2>
            <div className="flex space-x-4">
              <DocLink articleId="welcome-guide">
                Welcome Guide
              </DocLink>
              
              <DocLink articleId="setup-guide" variant="button">
                Setup Guide
              </DocLink>
              
              <div className="flex items-center">
                <span className="mr-2">View documentation:</span>
                <DocLink articleId="productivity-metrics" variant="icon" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <DocumentationBrowser />
        </div>
      </DocProvider>
    </div>
  );
}