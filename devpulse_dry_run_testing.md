# DevPulse Dry Run Testing Document

## UI Issues Identified

1. **Dashboard Page Icon Size Issue**
   - Problem: Icons in the dashboard are displaying at page width
   - Root cause: Missing size constraints in SVG elements
   - Fix: Add proper size constraints to SVG elements in the dashboard cards

2. **Project-level CSS Issues**
   - Problem: Some UI components are rendering like plain HTML without proper styling
   - Root cause: Tailwind classes not being properly applied or missing CSS rules
   - Fix: Ensure proper Tailwind classes are applied and fix CSS rules

3. **Burnout Data Display Issues**
   - Problem: API errors when fetching burnout data
   - Root cause: The burnout API route requires a repositoryId parameter that isn't being provided
   - Fix: Update the burnout page to include the required repositoryId parameter

## User Flows to Test During Dry Run

### 1. Authentication Flow
- User registration
- User login
- Password reset
- OAuth authentication (GitHub)
- Session persistence
- Logout functionality

### 2. Onboarding Flow
- Welcome screen
- Role selection
- Repository connection
- Initial setup completion
- Data privacy settings

### 3. Dashboard Navigation
- Main dashboard loading
- Navigation between different sections
- Sidebar collapse/expand
- Mobile responsiveness
- Dark/light mode toggle

### 4. Team Management
- Team overview
- Member invitation
- Role assignment
- Permission management
- Team metrics visualization

### 5. Repository Management
- Repository connection
- Repository selection
- Sync status monitoring
- Data refresh
- Repository settings

### 6. Analytics Features
- Productivity metrics display
- Burnout risk assessment
- Team collaboration metrics
- Knowledge distribution visualization
- Time range selection

### 7. Retrospective Features
- Retrospective creation
- Action item tracking
- Trend comparison
- Team insights panel
- Retrospective list navigation

### 8. User Profile Management
- Profile information update
- Notification preferences
- Data privacy settings
- Account deletion
- Connected services management

### 9. Admin Features
- System settings configuration
- User management
- Audit logs review
- App mode settings
- System health monitoring

### 10. Mock Mode Testing
- Mock user selection
- Mock data generation
- Mock API responses
- Mode indicator visibility
- Switching between mock and real data

## Testing Checklist

For each user flow:

- [ ] Verify all UI elements render correctly
- [ ] Test responsive behavior on different screen sizes
- [ ] Confirm data is loaded and displayed properly
- [ ] Validate form submissions and error handling
- [ ] Check keyboard shortcuts functionality
- [ ] Test accessibility features
- [ ] Verify proper state management during navigation
- [ ] Confirm proper error recovery
- [ ] Test performance under typical load
- [ ] Verify proper integration with backend services

## Specific Issues to Verify After Fixes

1. **Dashboard Icons**
   - Confirm icons display at proper size
   - Verify alignment and spacing
   - Check responsive behavior on different screen sizes

2. **CSS Styling**
   - Verify all components have proper styling applied
   - Check for consistent design system application
   - Confirm dark/light mode transitions

3. **Burnout Data**
   - Verify burnout data loads correctly
   - Test different time range selections
   - Confirm proper error handling when data is unavailable