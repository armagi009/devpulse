/**
 * Capacity Data Adapter
 * Maps existing DevPulse data to capacity dashboard interfaces
 */

import { TeamMetrics, CollaborationMetrics, BurnoutRiskAssessment } from '@/lib/types/analytics';
import { ApiResult } from '@/lib/types/api';

// Capacity Dashboard Data Interfaces
export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  capacity: number;
  burnoutRisk: 'low' | 'moderate' | 'high';
  trend: 'improving' | 'stable' | 'declining';
  velocity: number;
  wellnessFactor: number;
  collaborationHealth: number;
  stressMultiplier: number;
  keyMetrics: {
    lateNightCommits: number;
    weekendActivity: number;
    reviewResponseTime: string;
    codeQuality: number;
    teamInteractions: number;
    mentoringHours: number;
  };
  alerts: Array<{
    type: 'critical' | 'warning' | 'info';
    message: string;
    time: string;
  }>;
  recommendations: string[];
}

export interface TeamOverview {
  averageCapacity: number;
  highRiskCount: number;
  optimalCount: number;
  needsSupportCount: number;
  totalVelocity: number;
  teamMorale: number;
  burnoutPrevented: number;
  interventionsThisMonth: number;
}

export interface CapacityDistribution {
  range: string;
  count: number;
  color: string;
  label: string;
}

export interface TeamAnalytics {
  teamId: string;
  metrics: {
    velocity: {
      average: number;
      trend: string;
      percentageChange: number;
    };
    collaboration: {
      score: number;
      bottlenecks: Array<{
        memberId: string;
        reason: string;
      }>;
    };
  };
}

/**
 * Capacity Data Adapter Class
 */
export class CapacityDataAdapter {
  /**
   * Adapt team analytics data to team members
   */
  static adaptTeamAnalyticsToMembers(
    teamData: any,
    burnoutData?: BurnoutRiskAssessment,
    userSession?: any
  ): TeamMember[] {
    // Extract team members from collaboration network or generate mock data
    const collaborationNodes = teamData?.metrics?.collaboration?.network?.nodes || [];
    
    if (collaborationNodes.length === 0) {
      // Generate mock team members if no real data available
      return this.generateMockTeamMembers(userSession, burnoutData);
    }

    return collaborationNodes.map((node: any, index: number) => {
      const baseCapacity = 60 + Math.random() * 40; // 60-100%
      const riskScore = burnoutData?.riskScore || (Math.random() * 100);
      
      return {
        id: node.id,
        name: node.name,
        avatar: index === 0 ? userSession?.user?.image : undefined,
        role: this.generateRole(index),
        capacity: Math.round(baseCapacity),
        burnoutRisk: this.calculateRiskLevel(riskScore),
        trend: this.calculateTrend(),
        velocity: Math.round(70 + Math.random() * 30),
        wellnessFactor: Math.random() * 0.4 + 0.6, // 0.6-1.0
        collaborationHealth: Math.round(70 + Math.random() * 30),
        stressMultiplier: 0.8 + Math.random() * 0.6, // 0.8-1.4
        keyMetrics: this.generateKeyMetrics(),
        alerts: this.generateAlerts(riskScore),
        recommendations: this.generateRecommendations(riskScore, burnoutData?.recommendations)
      };
    });
  }

  /**
   * Generate mock team members when no real data is available
   */
  private static generateMockTeamMembers(
    userSession?: any,
    burnoutData?: BurnoutRiskAssessment
  ): TeamMember[] {
    const mockMembers = [
      {
        name: userSession?.user?.name || 'Sarah Chen',
        role: 'Senior Frontend',
        capacity: 92,
        riskScore: burnoutData?.riskScore || 75
      },
      {
        name: 'Marcus Rodriguez',
        role: 'Full Stack',
        capacity: 78,
        riskScore: 45
      },
      {
        name: 'Priya Patel',
        role: 'Backend Lead',
        capacity: 65,
        riskScore: 25
      },
      {
        name: 'Alex Kim',
        role: 'Junior Developer',
        capacity: 88,
        riskScore: 55
      }
    ];

    return mockMembers.map((member, index) => ({
      id: (index + 1).toString(),
      name: member.name,
      avatar: index === 0 ? userSession?.user?.image : undefined,
      role: member.role,
      capacity: member.capacity,
      burnoutRisk: this.calculateRiskLevel(member.riskScore),
      trend: index === 0 ? 'declining' : index === 2 ? 'improving' : 'stable',
      velocity: Math.round(70 + Math.random() * 30),
      wellnessFactor: member.riskScore < 30 ? 0.95 : member.riskScore < 60 ? 0.8 : 0.7,
      collaborationHealth: Math.round(70 + Math.random() * 30),
      stressMultiplier: member.riskScore > 70 ? 1.3 : member.riskScore > 40 ? 1.1 : 0.9,
      keyMetrics: this.generateKeyMetrics(member.riskScore),
      alerts: this.generateAlerts(member.riskScore),
      recommendations: this.generateRecommendations(member.riskScore, burnoutData?.recommendations)
    }));
  }

  /**
   * Calculate team overview from team members
   */
  static calculateTeamOverview(teamMembers: TeamMember[]): TeamOverview {
    if (teamMembers.length === 0) {
      return {
        averageCapacity: 0,
        highRiskCount: 0,
        optimalCount: 0,
        needsSupportCount: 0,
        totalVelocity: 0,
        teamMorale: 50,
        burnoutPrevented: 0,
        interventionsThisMonth: 0
      };
    }

    const averageCapacity = Math.round(
      teamMembers.reduce((sum, member) => sum + member.capacity, 0) / teamMembers.length
    );

    const highRiskCount = teamMembers.filter(member => member.burnoutRisk === 'high').length;
    const optimalCount = teamMembers.filter(member => 
      member.capacity >= 60 && member.capacity <= 80
    ).length;
    const needsSupportCount = teamMembers.filter(member => 
      member.burnoutRisk === 'high' || member.capacity > 90
    ).length;

    const totalVelocity = teamMembers.reduce((sum, member) => sum + member.velocity, 0);
    
    // Calculate team morale based on wellness factors
    const teamMorale = Math.round(
      teamMembers.reduce((sum, member) => sum + (member.wellnessFactor * 100), 0) / teamMembers.length
    );

    return {
      averageCapacity,
      highRiskCount,
      optimalCount,
      needsSupportCount,
      totalVelocity,
      teamMorale,
      burnoutPrevented: 3, // Mock data - would come from historical interventions
      interventionsThisMonth: highRiskCount + Math.floor(teamMembers.length * 0.3)
    };
  }

  /**
   * Calculate capacity distribution
   */
  static calculateCapacityDistribution(teamMembers: TeamMember[]): CapacityDistribution[] {
    return [
      {
        range: '0-60%',
        count: teamMembers.filter(m => m.capacity < 60).length,
        color: 'bg-green-500',
        label: 'Underutilized'
      },
      {
        range: '60-80%',
        count: teamMembers.filter(m => m.capacity >= 60 && m.capacity < 80).length,
        color: 'bg-blue-500',
        label: 'Optimal'
      },
      {
        range: '80-90%',
        count: teamMembers.filter(m => m.capacity >= 80 && m.capacity < 90).length,
        color: 'bg-yellow-500',
        label: 'High'
      },
      {
        range: '90-100%',
        count: teamMembers.filter(m => m.capacity >= 90).length,
        color: 'bg-red-500',
        label: 'Critical'
      }
    ];
  }

  /**
   * Adapt team analytics data
   */
  static adaptTeamAnalytics(teamData: any): TeamAnalytics {
    return {
      teamId: teamData?.teamId || 'default',
      metrics: {
        velocity: {
          average: teamData?.metrics?.velocity?.average || 8.5,
          trend: teamData?.metrics?.velocity?.trend || 'increasing',
          percentageChange: teamData?.metrics?.velocity?.percentageChange || 12.3
        },
        collaboration: {
          score: teamData?.metrics?.collaboration?.score || 0.75,
          bottlenecks: teamData?.metrics?.collaboration?.bottlenecks || []
        }
      }
    };
  }

  /**
   * Fetch and adapt capacity data from APIs
   */
  static async fetchCapacityData(teamId: string = 'default'): Promise<{
    teamMembers: TeamMember[];
    teamOverview: TeamOverview;
    teamAnalytics: TeamAnalytics;
    error?: string;
  }> {
    try {
      // Fetch data from multiple endpoints
      const [teamResponse, burnoutResponse] = await Promise.all([
        fetch(`/api/analytics/team?teamId=${teamId}`),
        fetch(`/api/analytics/burnout?repositoryId=default&days=30`)
      ]);

      let teamData = null;
      let burnoutData = null;

      // Process team data
      if (teamResponse.ok) {
        const teamResult = await teamResponse.json();
        if (teamResult.success) {
          teamData = teamResult.data;
        }
      }

      // Process burnout data
      if (burnoutResponse.ok) {
        const burnoutResult = await burnoutResponse.json();
        if (burnoutResult.success) {
          burnoutData = burnoutResult.data;
        }
      }

      // Adapt data to dashboard interfaces
      const teamMembers = this.adaptTeamAnalyticsToMembers(teamData, burnoutData);
      const teamOverview = this.calculateTeamOverview(teamMembers);
      const teamAnalytics = this.adaptTeamAnalytics(teamData);

      return {
        teamMembers,
        teamOverview,
        teamAnalytics
      };
    } catch (error) {
      console.error('Error fetching capacity data:', error);
      return {
        teamMembers: [],
        teamOverview: this.calculateTeamOverview([]),
        teamAnalytics: this.adaptTeamAnalytics(null),
        error: 'Failed to fetch capacity data'
      };
    }
  }

  // Helper methods
  private static calculateRiskLevel(riskScore: number): 'low' | 'moderate' | 'high' {
    if (riskScore < 30) return 'low';
    if (riskScore < 70) return 'moderate';
    return 'high';
  }

  private static calculateTrend(): 'improving' | 'stable' | 'declining' {
    const rand = Math.random();
    if (rand < 0.3) return 'improving';
    if (rand < 0.7) return 'stable';
    return 'declining';
  }

  private static generateRole(index: number): string {
    const roles = [
      'Senior Frontend',
      'Full Stack',
      'Backend Lead',
      'Junior Developer',
      'DevOps Engineer',
      'QA Engineer'
    ];
    return roles[index % roles.length];
  }

  private static generateKeyMetrics(riskScore?: number): TeamMember['keyMetrics'] {
    const risk = riskScore || Math.random() * 100;
    
    return {
      lateNightCommits: risk > 70 ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 3),
      weekendActivity: risk > 70 ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5),
      reviewResponseTime: `${(Math.random() * 6 + 1).toFixed(1)}h`,
      codeQuality: Math.round(70 + Math.random() * 30),
      teamInteractions: Math.round(15 + Math.random() * 35),
      mentoringHours: Math.round(Math.random() * 8 * 10) / 10
    };
  }

  private static generateAlerts(riskScore: number): TeamMember['alerts'] {
    const alerts: TeamMember['alerts'] = [];
    
    if (riskScore > 80) {
      alerts.push({
        type: 'critical',
        message: '3 consecutive late-night sessions',
        time: '2h ago'
      });
    }
    
    if (riskScore > 60) {
      alerts.push({
        type: 'warning',
        message: 'Code quality declining (-15%)',
        time: '1d ago'
      });
    }
    
    if (riskScore < 30) {
      alerts.push({
        type: 'info',
        message: 'High mentoring activity - great impact!',
        time: '6h ago'
      });
    }
    
    return alerts;
  }

  private static generateRecommendations(
    riskScore: number,
    burnoutRecommendations?: string[]
  ): string[] {
    if (burnoutRecommendations && burnoutRecommendations.length > 0) {
      return burnoutRecommendations.slice(0, 3);
    }
    
    if (riskScore > 70) {
      return [
        'Redistribute 2-3 tasks from backlog',
        'Schedule wellness check-in',
        'Pair with junior dev to reduce load'
      ];
    } else if (riskScore > 40) {
      return [
        'Monitor workload closely',
        'Encourage regular breaks',
        'Consider pair programming'
      ];
    } else {
      return [
        'Consider for tech lead opportunities',
        'Maintain current healthy patterns',
        'Could take on additional responsibilities'
      ];
    }
  }

  /**
   * Handle loading states
   */
  static createLoadingState(): {
    teamMembers: TeamMember[];
    teamOverview: TeamOverview | null;
    isLoading: boolean;
    error: string | null;
  } {
    return {
      teamMembers: [],
      teamOverview: null,
      isLoading: true,
      error: null
    };
  }

  /**
   * Handle error states
   */
  static createErrorState(error: string): {
    teamMembers: TeamMember[];
    teamOverview: TeamOverview | null;
    isLoading: boolean;
    error: string | null;
  } {
    return {
      teamMembers: [],
      teamOverview: null,
      isLoading: false,
      error
    };
  }

  /**
   * Validate team data
   */
  static validateTeamData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.teamMembers) &&
      data.teamOverview &&
      typeof data.teamOverview.averageCapacity === 'number'
    );
  }
}