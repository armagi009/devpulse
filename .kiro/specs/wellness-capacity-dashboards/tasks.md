# Wellness & Capacity Dashboards Implementation Tasks

## Overview
Implement two new dashboard components based on existing prototypes, leveraging DevPulse's existing data and infrastructure.

## Implementation Tasks

- [x] 1. Create Developer Wellness Dashboard Page
  - Create `/dashboard/wellness` route for developer role
  - Adapt `devpulse_burnout_prevention_devrole.tsx` to work with DevPulse
  - Map existing burnout data from `BurnoutRiskAssessment` API
  - Integrate with existing productivity metrics and GitHub activity data
  - Add role-based access control for developer role only
  - _Requirements: Developer wellness monitoring, AI insights integration_

- [x] 2. Create Manager Capacity Dashboard Page  
  - Create `/dashboard/capacity` route for manager/team-lead roles
  - Adapt `devpulse_manager_dashboard.tsx` to work with DevPulse
  - Map existing team analytics and burnout metrics for team view
  - Integrate with existing user management and team data
  - Add role-based access control for manager/team-lead roles only
  - _Requirements: Team capacity management, member risk monitoring_

- [x] 3. Update Header Navigation Links
  - Replace "Retrospectives" link in Header.tsx with role-based wellness/capacity links
  - Add "Wellness" link for users with developer permissions
  - Add "Capacity Intelligence" link for users with manager/team-lead permissions  
  - Ensure proper role-based visibility using existing permission system
  - _Requirements: Role-based navigation, replace retrospectives with wellness dashboards_

- [x] 4. Adapt Styling and Components
  - Update dashboard styling to match DevPulse design system
  - Replace external dependencies with DevPulse UI components
  - Ensure responsive design works with existing layout system
  - Fix TypeScript types and import issues
  - _Requirements: Consistent UI/UX, proper TypeScript integration_

- [x] 5. Data Integration and Mapping
  - Create data adapters to map existing DevPulse data to dashboard interfaces
  - Integrate with existing `/api/analytics/burnout` endpoint
  - Integrate with existing team analytics and user data APIs
  - Handle loading states and error conditions properly
  - _Requirements: Seamless data integration, proper error handling_

- [x] 6. Testing and Validation
  - Test both dashboards with different user roles
  - Verify data displays correctly from existing APIs
  - Test responsive design on different screen sizes
  - Validate role-based access controls work properly
  - _Requirements: Quality assurance, proper functionality verification_

## Data Sources Available
- **Burnout Data**: `BurnoutRiskAssessment` from `/api/analytics/burnout`
- **Team Analytics**: Team collaboration metrics, velocity data
- **User Data**: Profile information, role assignments
- **GitHub Activity**: Commits, PRs, issues from existing sync
- **Productivity Metrics**: Existing productivity calculations

## Technical Notes
- Both dashboards should use existing DevPulse authentication and session management
- Leverage existing role-based permission system (`usePermissions` hook)
- Use existing UI components from `@/components/ui/` where possible
- Follow existing error handling and loading state patterns
- Maintain existing responsive design principles

## Success Criteria
- Developers can access a comprehensive wellness dashboard at `/dashboard/wellness`
- Managers can access team capacity intelligence at `/dashboard/capacity`
- Both dashboards display real data from existing DevPulse APIs
- Navigation links appear correctly based on user roles
- Dashboards are fully responsive and match DevPulse design system
- All functionality works without breaking existing features