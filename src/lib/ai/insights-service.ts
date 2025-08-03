/**
 * AI Insights Service
 * Generates AI-powered insights and recommendations
 */

import { 
  generateCompletion, 
  generateStructuredData, 
  isOpenAIAvailable 
} from '@/lib/ai/openai-client';
import { prisma } from '@/lib/db/prisma';
import { 
  BurnoutRiskAssessment, 
  ProductivityMetrics, 
  TeamMetrics, 
  Retrospective, 
  Recommendation, 
  Insight 
} from '@/lib/types/analytics';
import { subDays, format } from 'date-fns';

/**
 * Generate burnout intervention recommendations
 */
export async function generateBurnoutRecommendations(
  burnoutData: BurnoutRiskAssessment
): Promise<Recommendation[]> {
  try {
    // Check if OpenAI is available
    const aiAvailable = await isOpenAIAvailable();
    
    if (!aiAvailable) {
      // Fall back to statistical recommendations
      return generateStatisticalBurnoutRecommendations(burnoutData);
    }
    
    // Generate prompt
    const prompt = `
Generate personalized recommendations to help prevent burnout based on the following assessment:

Risk Score: ${burnoutData.riskScore}/100
Confidence: ${Math.round(burnoutData.confidence * 100)}%

Key Contributing Factors:
${burnoutData.keyFactors.map(factor => `- ${factor.name} (Impact: ${Math.round(factor.impact * 100)}%): ${factor.description}`).join('\n')}

Generate 3-5 specific, actionable recommendations that address these factors. Each recommendation should have:
1. A clear title
2. A brief description explaining the recommendation
3. 2-3 specific action items the user can take to implement the recommendation

Focus on practical advice that can be implemented immediately to reduce burnout risk.
`;

    // Define schema for structured response
    const schema = `
{
  "recommendations": [
    {
      "id": "string",
      "type": "personal",
      "priority": "high|medium|low",
      "title": "string",
      "description": "string",
      "actionItems": ["string", "string", "string"]
    },
    ...
  ]
}
`;

    // Generate structured recommendations
    const response = await generateStructuredData<{ recommendations: Recommendation[] }>(
      prompt,
      schema,
      { temperature: 0.7 }
    );
    
    return response.recommendations;
  } catch (error) {
    console.error('Error generating burnout recommendations:', error);
    
    // Fall back to statistical recommendations
    return generateStatisticalBurnoutRecommendations(burnoutData);
  }
}

/**
 * Generate statistical burnout recommendations (fallback)
 */
function generateStatisticalBurnoutRecommendations(
  burnoutData: BurnoutRiskAssessment
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Add recommendations based on risk score
  if (burnoutData.riskScore > 70) {
    recommendations.push({
      id: 'high-risk-1',
      type: 'personal',
      priority: 'high',
      title: 'Take Time Off',
      description: 'Your burnout risk is high. Consider taking some time off to recharge.',
      actionItems: [
        'Schedule at least 2-3 days off in the next two weeks',
        'Disconnect completely from work during your time off',
        'Engage in activities that help you relax and recover'
      ],
    });
    
    recommendations.push({
      id: 'high-risk-2',
      type: 'personal',
      priority: 'high',
      title: 'Discuss Workload with Manager',
      description: 'Your current workload may be unsustainable. Have a conversation about priorities and support.',
      actionItems: [
        'Schedule a meeting with your manager to discuss your workload',
        'Prepare a list of your current tasks and their priorities',
        'Be clear about what you need to reduce your stress level'
      ],
    });
  } else if (burnoutData.riskScore > 50) {
    recommendations.push({
      id: 'medium-risk-1',
      type: 'personal',
      priority: 'medium',
      title: 'Improve Work-Life Balance',
      description: 'Your work patterns show signs of potential burnout. Focus on establishing better boundaries.',
      actionItems: [
        'Set specific work hours and stick to them',
        'Take regular breaks during the day',
        'Avoid checking work communications during off hours'
      ],
    });
  } else {
    recommendations.push({
      id: 'low-risk-1',
      type: 'personal',
      priority: 'low',
      title: 'Maintain Healthy Habits',
      description: 'Your burnout risk is low. Keep up the good work by maintaining healthy habits.',
      actionItems: [
        'Continue to maintain regular work hours',
        'Take breaks throughout the day',
        'Regularly assess your stress levels'
      ],
    });
  }
  
  // Add recommendations based on key factors
  burnoutData.keyFactors.forEach((factor, index) => {
    if (factor.impact > 0.6) {
      let recommendation: Recommendation | null = null;
      
      switch (factor.name) {
        case 'Work Hours Pattern':
          recommendation = {
            id: `factor-${index}`,
            type: 'personal',
            priority: factor.impact > 0.8 ? 'high' : 'medium',
            title: 'Establish Regular Work Hours',
            description: 'Your work hours are irregular, which can contribute to burnout.',
            actionItems: [
              'Set consistent start and end times for your workday',
              'Avoid working late at night or early in the morning',
              'Use calendar blocking to protect your personal time'
            ],
          };
          break;
        case 'Weekend Work Frequency':
          recommendation = {
            id: `factor-${index}`,
            type: 'personal',
            priority: factor.impact > 0.8 ? 'high' : 'medium',
            title: 'Protect Your Weekends',
            description: 'Working on weekends reduces recovery time and increases burnout risk.',
            actionItems: [
              'Commit to keeping weekends work-free',
              'Plan enjoyable activities for your weekends',
              'If weekend work is necessary, compensate with time off during the week'
            ],
          };
          break;
        case 'Workload Distribution':
          recommendation = {
            id: `factor-${index}`,
            type: 'personal',
            priority: factor.impact > 0.8 ? 'high' : 'medium',
            title: 'Balance Your Workload',
            description: 'Your workload has significant spikes, which can lead to stress and burnout.',
            actionItems: [
              'Break large tasks into smaller, manageable chunks',
              'Spread deadlines more evenly throughout the week',
              'Learn to say no or negotiate deadlines when your workload is too high'
            ],
          };
          break;
      }
      
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }
  });
  
  // Return up to 5 recommendations
  return recommendations.slice(0, 5);
}

/**
 * Generate productivity insights
 */
export async function generateProductivityInsights(
  metrics: ProductivityMetrics
): Promise<Insight[]> {
  try {
    // Check if OpenAI is available
    const aiAvailable = await isOpenAIAvailable();
    
    if (!aiAvailable) {
      // Fall back to statistical insights
      return generateStatisticalProductivityInsights(metrics);
    }
    
    // Generate prompt
    const prompt = `
Analyze the following productivity metrics and generate insights:

Time Period: ${format(metrics.timeRange.start, 'yyyy-MM-dd')} to ${format(metrics.timeRange.end, 'yyyy-MM-dd')}
Commit Count: ${metrics.commitCount}
Lines Added: ${metrics.linesAdded}
Lines Deleted: ${metrics.linesDeleted}
PR Count: ${metrics.prCount}
Issue Count: ${metrics.issueCount}
Average Commit Size: ${metrics.avgCommitSize || 'N/A'} lines
Average PR Size: ${metrics.avgPrSize || 'N/A'} lines
Average Time to Merge PR: ${metrics.avgTimeToMergePr || 'N/A'} hours
Average Time to Resolve Issue: ${metrics.avgTimeToResolveIssue || 'N/A'} hours
Code Quality Score: ${metrics.codeQualityScore}/100

Work Hours Distribution:
${metrics.workHoursDistribution.filter(h => h.count > 0).map(h => `Hour ${h.hour}: ${h.count} commits`).join('\n')}

Weekday Distribution:
${metrics.weekdayDistribution.map(d => `Day ${d.day} (${getDayName(d.day)}): ${d.count} commits`).join('\n')}

Generate 3-5 specific insights about this developer's productivity patterns. Each insight should have:
1. A clear title
2. A description explaining the insight and its significance
3. Relevant metrics that support this insight
4. A trend assessment (improving, stable, or declining)
5. A confidence score (0-1) indicating how confident you are in this insight

Focus on actionable insights that can help the developer improve their productivity.
`;

    // Define schema for structured response
    const schema = `
{
  "insights": [
    {
      "id": "string",
      "type": "productivity",
      "title": "string",
      "description": "string",
      "metrics": {
        "key1": number,
        "key2": number,
        ...
      },
      "trend": "improving|stable|declining",
      "confidence": number
    },
    ...
  ]
}
`;

    // Generate structured insights
    const response = await generateStructuredData<{ insights: Insight[] }>(
      prompt,
      schema,
      { temperature: 0.7 }
    );
    
    return response.insights;
  } catch (error) {
    console.error('Error generating productivity insights:', error);
    
    // Fall back to statistical insights
    return generateStatisticalProductivityInsights(metrics);
  }
}

/**
 * Generate statistical productivity insights (fallback)
 */
function generateStatisticalProductivityInsights(
  metrics: ProductivityMetrics
): Insight[] {
  const insights: Insight[] = [];
  
  // Insight 1: Work hours pattern
  const workHoursDistribution = metrics.workHoursDistribution;
  const earlyMorningCommits = workHoursDistribution
    .filter(h => h.hour >= 5 && h.hour < 9)
    .reduce((sum, h) => sum + h.count, 0);
  const normalHoursCommits = workHoursDistribution
    .filter(h => h.hour >= 9 && h.hour < 17)
    .reduce((sum, h) => sum + h.count, 0);
  const eveningCommits = workHoursDistribution
    .filter(h => h.hour >= 17 && h.hour < 22)
    .reduce((sum, h) => sum + h.count, 0);
  const lateNightCommits = workHoursDistribution
    .filter(h => h.hour >= 22 || h.hour < 5)
    .reduce((sum, h) => sum + h.count, 0);
  
  const totalCommits = metrics.commitCount;
  const normalHoursPercentage = totalCommits > 0 ? (normalHoursCommits / totalCommits) * 100 : 0;
  
  insights.push({
    id: 'work-hours-pattern',
    type: 'productivity',
    title: 'Work Hours Pattern',
    description: normalHoursPercentage > 70
      ? 'You primarily work during standard business hours, which is good for work-life balance.'
      : 'A significant portion of your work happens outside standard business hours, which may affect work-life balance.',
    metrics: {
      earlyMorningPercentage: totalCommits > 0 ? (earlyMorningCommits / totalCommits) * 100 : 0,
      normalHoursPercentage,
      eveningPercentage: totalCommits > 0 ? (eveningCommits / totalCommits) * 100 : 0,
      lateNightPercentage: totalCommits > 0 ? (lateNightCommits / totalCommits) * 100 : 0,
    },
    trend: 'stable',
    confidence: 0.8,
  });
  
  // Insight 2: Code quality
  insights.push({
    id: 'code-quality',
    type: 'productivity',
    title: 'Code Quality Assessment',
    description: metrics.codeQualityScore > 70
      ? 'Your code quality score is high, indicating good practices in your development workflow.'
      : 'There may be opportunities to improve your code quality through better practices.',
    metrics: {
      codeQualityScore: metrics.codeQualityScore,
      avgCommitSize: metrics.avgCommitSize || 0,
      avgPrSize: metrics.avgPrSize || 0,
    },
    trend: metrics.codeQualityScore > 60 ? 'improving' : 'stable',
    confidence: 0.7,
  });
  
  // Insight 3: Work distribution
  const weekdayDistribution = metrics.weekdayDistribution;
  const weekdayCommits = weekdayDistribution
    .filter(d => d.day >= 1 && d.day <= 5)
    .reduce((sum, d) => sum + d.count, 0);
  const weekendCommits = weekdayDistribution
    .filter(d => d.day === 0 || d.day === 6)
    .reduce((sum, d) => sum + d.count, 0);
  
  insights.push({
    id: 'work-distribution',
    type: 'productivity',
    title: 'Weekly Work Distribution',
    description: weekendCommits > (totalCommits * 0.2)
      ? 'You have a significant amount of weekend work, which may impact work-life balance.'
      : 'Your work is primarily distributed during weekdays, which is good for work-life balance.',
    metrics: {
      weekdayPercentage: totalCommits > 0 ? (weekdayCommits / totalCommits) * 100 : 0,
      weekendPercentage: totalCommits > 0 ? (weekendCommits / totalCommits) * 100 : 0,
    },
    trend: weekendCommits > (totalCommits * 0.3) ? 'declining' : 'stable',
    confidence: 0.9,
  });
  
  return insights;
}

/**
 * Generate team insights
 */
export async function generateTeamInsights(
  teamMetrics: TeamMetrics
): Promise<Insight[]> {
  try {
    // Check if OpenAI is available
    const aiAvailable = await isOpenAIAvailable();
    
    if (!aiAvailable) {
      // Fall back to statistical insights
      return generateStatisticalTeamInsights(teamMetrics);
    }
    
    // Generate prompt
    const prompt = `
Analyze the following team metrics and generate insights:

Time Period: ${format(teamMetrics.timeRange.start, 'yyyy-MM-dd')} to ${format(teamMetrics.timeRange.end, 'yyyy-MM-dd')}
Repository ID: ${teamMetrics.repositoryId}
Team Size: ${teamMetrics.memberCount} members
Total Commits: ${teamMetrics.totalCommits}
Total PRs: ${teamMetrics.totalPRs}
Total Issues: ${teamMetrics.totalIssues}

Velocity Metrics:
- Velocity Score: ${teamMetrics.velocity.velocityScore}/100
- Commit Frequency: ${teamMetrics.velocity.commitFrequency} commits per day
- PR Merge Rate: ${Math.round(teamMetrics.velocity.prMergeRate * 100)}%
- Issue Resolution Rate: ${Math.round(teamMetrics.velocity.issueResolutionRate * 100)}%
- Cycle Time Average: ${teamMetrics.velocity.cycleTimeAverage} hours

Collaboration Metrics:
- Collaboration Score: ${teamMetrics.collaboration.collaborationScore}/100
- PR Review Distribution: ${teamMetrics.collaboration.prReviewDistribution.length} reviewers
- Code Ownership Distribution: ${teamMetrics.collaboration.codeOwnershipDistribution.length} owners

Knowledge Distribution:
- Knowledge Sharing Score: ${teamMetrics.knowledgeDistribution.knowledgeSharingScore}/100
- File Ownership: ${teamMetrics.knowledgeDistribution.fileOwnership.length} files
- Risk Areas: ${teamMetrics.knowledgeDistribution.riskAreas.length} identified risk areas

Generate 3-5 specific insights about this team's collaboration patterns and performance. Each insight should have:
1. A clear title
2. A description explaining the insight and its significance
3. Relevant metrics that support this insight
4. A trend assessment (improving, stable, or declining)
5. A confidence score (0-1) indicating how confident you are in this insight

Focus on actionable insights that can help the team improve their collaboration and productivity.
`;

    // Define schema for structured response
    const schema = `
{
  "insights": [
    {
      "id": "string",
      "type": "collaboration",
      "title": "string",
      "description": "string",
      "metrics": {
        "key1": number,
        "key2": number,
        ...
      },
      "trend": "improving|stable|declining",
      "confidence": number
    },
    ...
  ]
}
`;

    // Generate structured insights
    const response = await generateStructuredData<{ insights: Insight[] }>(
      prompt,
      schema,
      { temperature: 0.7 }
    );
    
    return response.insights;
  } catch (error) {
    console.error('Error generating team insights:', error);
    
    // Fall back to statistical insights
    return generateStatisticalTeamInsights(teamMetrics);
  }
}

/**
 * Generate statistical team insights (fallback)
 */
function generateStatisticalTeamInsights(
  teamMetrics: TeamMetrics
): Insight[] {
  const insights: Insight[] = [];
  
  // Insight 1: Team velocity
  insights.push({
    id: 'team-velocity',
    type: 'collaboration',
    title: 'Team Velocity Assessment',
    description: teamMetrics.velocity.velocityScore > 70
      ? 'The team has a high velocity score, indicating good productivity and efficiency.'
      : 'The team\'s velocity could be improved to increase productivity and efficiency.',
    metrics: {
      velocityScore: teamMetrics.velocity.velocityScore,
      commitFrequency: teamMetrics.velocity.commitFrequency,
      prMergeRate: Math.round(teamMetrics.velocity.prMergeRate * 100),
      cycleTimeAverage: teamMetrics.velocity.cycleTimeAverage,
    },
    trend: teamMetrics.velocity.velocityScore > 60 ? 'improving' : 'stable',
    confidence: 0.8,
  });
  
  // Insight 2: Collaboration assessment
  insights.push({
    id: 'collaboration-assessment',
    type: 'collaboration',
    title: 'Team Collaboration Assessment',
    description: teamMetrics.collaboration.collaborationScore > 70
      ? 'The team demonstrates strong collaboration patterns with good distribution of reviews and contributions.'
      : 'There are opportunities to improve team collaboration through more balanced review distribution.',
    metrics: {
      collaborationScore: teamMetrics.collaboration.collaborationScore,
      reviewerCount: teamMetrics.collaboration.prReviewDistribution.length,
      ownerCount: teamMetrics.collaboration.codeOwnershipDistribution.length,
    },
    trend: teamMetrics.collaboration.collaborationScore > 60 ? 'improving' : 'stable',
    confidence: 0.7,
  });
  
  // Insight 3: Knowledge distribution
  insights.push({
    id: 'knowledge-distribution',
    type: 'collaboration',
    title: 'Knowledge Distribution Assessment',
    description: teamMetrics.knowledgeDistribution.knowledgeSharingScore > 70
      ? 'Knowledge is well distributed across the team, reducing bus factor risk.'
      : 'There may be knowledge silos within the team that could pose risks.',
    metrics: {
      knowledgeSharingScore: teamMetrics.knowledgeDistribution.knowledgeSharingScore,
      riskAreaCount: teamMetrics.knowledgeDistribution.riskAreas.length,
      fileCount: teamMetrics.knowledgeDistribution.fileOwnership.length,
    },
    trend: teamMetrics.knowledgeDistribution.knowledgeSharingScore > 60 ? 'improving' : 'declining',
    confidence: 0.75,
  });
  
  return insights;
}

/**
 * Generate team retrospective
 */
export async function generateRetrospective(
  teamMetrics: TeamMetrics
): Promise<Retrospective> {
  try {
    // Check if OpenAI is available
    const aiAvailable = await isOpenAIAvailable();
    
    if (!aiAvailable) {
      // Fall back to statistical retrospective
      return generateStatisticalRetrospective(teamMetrics);
    }
    
    // Get additional context for retrospective
    const repositoryDetails = await prisma.repository.findUnique({
      where: { id: teamMetrics.repositoryId },
      select: { name: true, fullName: true },
    });
    
    // Get recent pull requests
    const recentPRs = await prisma.pullRequest.findMany({
      where: {
        repositoryId: teamMetrics.repositoryId,
        createdAt: {
          gte: teamMetrics.timeRange.start,
          lte: teamMetrics.timeRange.end,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        title: true,
        state: true,
        createdAt: true,
        mergedAt: true,
        author: {
          select: { username: true },
        },
      },
    });
    
    // Get recent issues
    const recentIssues = await prisma.issue.findMany({
      where: {
        repositoryId: teamMetrics.repositoryId,
        createdAt: {
          gte: teamMetrics.timeRange.start,
          lte: teamMetrics.timeRange.end,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        title: true,
        state: true,
        createdAt: true,
        closedAt: true,
        author: {
          select: { username: true },
        },
      },
    });
    
    // Generate prompt
    const prompt = `
Generate a team retrospective for the following repository:

Repository: ${repositoryDetails?.fullName || teamMetrics.repositoryId}
Time Period: ${format(teamMetrics.timeRange.start, 'yyyy-MM-dd')} to ${format(teamMetrics.timeRange.end, 'yyyy-MM-dd')}
Team Size: ${teamMetrics.memberCount} members
Total Commits: ${teamMetrics.totalCommits}
Total PRs: ${teamMetrics.totalPRs}
Total Issues: ${teamMetrics.totalIssues}

Velocity Metrics:
- Velocity Score: ${teamMetrics.velocity.velocityScore}/100
- Commit Frequency: ${teamMetrics.velocity.commitFrequency} commits per day
- PR Merge Rate: ${Math.round(teamMetrics.velocity.prMergeRate * 100)}%
- Issue Resolution Rate: ${Math.round(teamMetrics.velocity.issueResolutionRate * 100)}%
- Cycle Time Average: ${teamMetrics.velocity.cycleTimeAverage} hours

Collaboration Metrics:
- Collaboration Score: ${teamMetrics.collaboration.collaborationScore}/100
- Knowledge Sharing Score: ${teamMetrics.knowledgeDistribution.knowledgeSharingScore}/100

Recent Pull Requests:
${recentPRs.map(pr => `- "${pr.title}" by ${pr.author?.username || 'Unknown'} (${pr.state})`).join('\n')}

Recent Issues:
${recentIssues.map(issue => `- "${issue.title}" by ${issue.author?.username || 'Unknown'} (${issue.state})`).join('\n')}

Based on this data, generate a comprehensive retrospective that includes:
1. What went well during this period (3-5 points)
2. Areas for improvement (3-5 points)
3. Specific action items for the team (3-5 points)
4. An assessment of team health with observations
5. Recommendations for the next sprint

Focus on actionable insights and specific patterns you observe in the data.
`;

    // Define schema for structured response
    const schema = `
{
  "retrospective": {
    "period": {
      "start": "2025-07-01T00:00:00Z",
      "end": "2025-07-30T00:00:00Z"
    },
    "positives": [
      "string",
      "string",
      "string"
    ],
    "improvements": [
      "string",
      "string",
      "string"
    ],
    "actionItems": [
      "string",
      "string",
      "string"
    ],
    "teamHealth": {
      "score": 75,
      "observations": [
        "string",
        "string"
      ]
    },
    "recommendations": [
      "string",
      "string",
      "string"
    ]
  }
}
`;

    // Generate structured retrospective
    const response = await generateStructuredData<{ retrospective: Retrospective }>(
      prompt,
      schema,
      { temperature: 0.7 }
    );
    
    return response.retrospective;
  } catch (error) {
    console.error('Error generating retrospective:', error);
    
    // Fall back to statistical retrospective
    return generateStatisticalRetrospective(teamMetrics);
  }
}

/**
 * Generate statistical retrospective (fallback)
 */
function generateStatisticalRetrospective(
  teamMetrics: TeamMetrics
): Retrospective {
  // Calculate team health score based on velocity and collaboration
  const teamHealthScore = Math.round(
    (teamMetrics.velocity.velocityScore + 
     teamMetrics.collaboration.collaborationScore + 
     teamMetrics.knowledgeDistribution.knowledgeSharingScore) / 3
  );
  
  // Generate positives based on metrics
  const positives: string[] = [];
  
  if (teamMetrics.velocity.velocityScore > 70) {
    positives.push('The team maintained a high velocity score, demonstrating good productivity.');
  }
  
  if (teamMetrics.velocity.prMergeRate > 0.7) {
    positives.push(`Strong PR merge rate of ${Math.round(teamMetrics.velocity.prMergeRate * 100)}%, indicating efficient code review processes.`);
  }
  
  if (teamMetrics.collaboration.collaborationScore > 70) {
    positives.push('Good collaboration across the team with balanced code reviews and contributions.');
  }
  
  if (teamMetrics.knowledgeDistribution.knowledgeSharingScore > 70) {
    positives.push('Knowledge is well distributed across the team, reducing bus factor risk.');
  }
  
  if (teamMetrics.velocity.cycleTimeAverage < 48) {
    positives.push(`Quick cycle time average of ${Math.round(teamMetrics.velocity.cycleTimeAverage)} hours from PR creation to merge.`);
  }
  
  // Ensure we have at least 3 positives
  if (positives.length < 3) {
    positives.push('Team members contributed consistently throughout the period.');
    positives.push('The team successfully closed multiple issues and merged pull requests.');
    positives.push('Communication within the team was effective for completing tasks.');
  }
  
  // Generate improvements based on metrics
  const improvements: string[] = [];
  
  if (teamMetrics.velocity.velocityScore < 60) {
    improvements.push('Team velocity could be improved to increase overall productivity.');
  }
  
  if (teamMetrics.velocity.prMergeRate < 0.6) {
    improvements.push(`PR merge rate of ${Math.round(teamMetrics.velocity.prMergeRate * 100)}% indicates potential bottlenecks in the review process.`);
  }
  
  if (teamMetrics.collaboration.collaborationScore < 60) {
    improvements.push('Collaboration patterns show imbalances in code reviews and contributions.');
  }
  
  if (teamMetrics.knowledgeDistribution.knowledgeSharingScore < 60) {
    improvements.push('Knowledge silos exist within the team, creating potential risks.');
  }
  
  if (teamMetrics.velocity.cycleTimeAverage > 72) {
    improvements.push(`Long cycle time average of ${Math.round(teamMetrics.velocity.cycleTimeAverage)} hours from PR creation to merge.`);
  }
  
  // Ensure we have at least 3 improvements
  if (improvements.length < 3) {
    improvements.push('Code review process could be more efficient to reduce cycle time.');
    improvements.push('More balanced distribution of tasks across team members would improve resilience.');
    improvements.push('Documentation of code and processes could be improved for better knowledge sharing.');
  }
  
  // Generate action items
  const actionItems = [
    'Schedule regular knowledge sharing sessions to reduce knowledge silos.',
    'Implement a more structured code review process to improve PR merge rate.',
    'Break down larger tasks into smaller, more manageable pieces to improve velocity.',
    'Rotate responsibilities to ensure knowledge is shared across the team.',
    'Set up automated tests to catch issues earlier in the development process.',
  ].slice(0, 5);
  
  // Generate observations
  const observations = [
    teamHealthScore > 70
      ? 'The team is performing well overall with good collaboration and productivity.'
      : 'The team has several areas for improvement to enhance collaboration and productivity.',
    teamMetrics.velocity.velocityScore > teamMetrics.collaboration.collaborationScore
      ? 'The team prioritizes velocity over collaboration, which may lead to quality issues over time.'
      : 'The team has a good balance of velocity and collaboration, supporting sustainable development.',
  ];
  
  // Generate recommendations
  const recommendations = [
    'Focus on knowledge sharing to reduce bus factor risk.',
    'Implement pair programming for complex tasks to improve code quality and knowledge sharing.',
    'Review and optimize the PR review process to reduce cycle time.',
    'Consider team-building activities to strengthen collaboration.',
    'Establish clear coding standards and documentation practices.',
  ].slice(0, 5);
  
  return {
    period: teamMetrics.timeRange,
    positives: positives.slice(0, 5),
    improvements: improvements.slice(0, 5),
    actionItems,
    teamHealth: {
      score: teamHealthScore,
      observations,
    },
    recommendations,
  };
}

/**
 * Helper function to get day name from day number
 */
function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || `Day ${day}`;
}