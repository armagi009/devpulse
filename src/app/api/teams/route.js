/**
 * Teams API Route
 * Handles team-related operations
 */

export async function GET(request) {
  // Get query parameters
  const url = new URL(request.url);
  const role = url.searchParams.get('role');
  
  // Mock data for teams
  const mockTeams = [
    {
      id: '1',
      name: 'Frontend Team',
      description: 'Responsible for UI/UX development',
      leadId: '101',
      leadName: 'Jane Smith',
      memberCount: 8,
      repositories: 12,
      role: role || 'member',
      _count: { members: 8 }
    },
    {
      id: '2',
      name: 'Backend Team',
      description: 'API and server-side development',
      leadId: '102',
      leadName: 'John Doe',
      memberCount: 6,
      repositories: 8,
      role: role || 'member',
      _count: { members: 6 }
    },
    {
      id: '3',
      name: 'DevOps Team',
      description: 'Infrastructure and deployment',
      leadId: '103',
      leadName: 'Alice Johnson',
      memberCount: 4,
      repositories: 6,
      role: role || 'member',
      _count: { members: 4 }
    },
    {
      id: '4',
      name: 'QA Team',
      description: 'Quality assurance and testing',
      leadId: '104',
      leadName: 'Bob Brown',
      memberCount: 5,
      repositories: 3,
      role: role || 'member',
      _count: { members: 5 }
    },
  ];
  
  // Filter teams based on role if specified
  let filteredTeams = mockTeams;
  if (role === 'lead') {
    // For team leads, only return teams they lead
    filteredTeams = mockTeams.slice(0, 2);
  }
  
  // Return the teams
  return Response.json(filteredTeams);
}