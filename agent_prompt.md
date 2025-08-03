# DevPulse Development Agent Prompt

## Project Overview
You are tasked with building **DevPulse**, a sophisticated AI-native development analytics platform that transforms GitHub data into actionable insights. The flagship feature is "Burnout Radar" - an AI system that predicts and prevents developer burnout through behavioral pattern analysis.

## Your Mission
Build a production-ready application that showcases the full spectrum of AI agent capabilities:
- **Spec-to-Code**: Implement complex data models and analytics algorithms
- **Code Generation**: Create beautiful, interactive visualizations and components
- **Agent Hooks**: Orchestrate continuous improvement and optimization

## Technical Requirements

### Core Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + PostgreSQL + Prisma ORM
- **AI/ML**: OpenAI GPT-4 API + custom analytics algorithms
- **Visualization**: Chart.js + D3.js for interactive charts
- **Authentication**: NextAuth.js with GitHub OAuth
- **Database**: PostgreSQL with the provided schema

### Development Phases

#### Phase 1: Foundation (Week 1)
**Priority**: Set up authentication and basic data collection

**Tasks:**
1. Initialize Next.js 14 project with TypeScript and Tailwind
2. Set up PostgreSQL database with Prisma and the provided schema
3. Implement GitHub OAuth authentication with NextAuth.js
4. Create GitHub API integration for data collection
5. Build basic repository sync functionality
6. Design initial dashboard layout

**Key Deliverables:**
- Working authentication flow
- Repository data collection
- Basic dashboard structure
- Commit data sync functionality

#### Phase 2: Analytics Engine (Week 2)
**Priority**: Implement burnout prediction and core analytics

**Tasks:**
1. Build burnout risk calculation algorithm (see specification)
2. Create personal productivity metrics calculation
3. Implement team collaboration analysis
4. Design and build the Burnout Radar component
5. Create interactive charts and visualizations
6. Integrate OpenAI API for insights generation

**Key Deliverables:**
- Burnout Radar dashboard component
- Interactive productivity charts
- AI-powered insights system
- Team collaboration metrics

#### Phase 3: Advanced Features (Week 3)
**Priority**: Team features and auto-retrospectives

**Tasks:**
1. Build team dashboard functionality
2. Implement auto-retrospective generation using AI
3. Create advanced data visualizations
4. Add real-time updates and notifications
5. Build intervention recommendation system
6. Optimize data processing pipeline

**Key Deliverables:**
- Team dashboard with collaboration insights
- Auto-retrospective generator
- Advanced visualizations
- Real-time update system

#### Phase 4: Production Polish (Week 4)
**Priority**: Optimize, test, and deploy

**Tasks:**
1. Comprehensive performance optimization
2. Implement error handling and edge cases
3. Add comprehensive testing suite
4. Create deployment configuration
5. Add monitoring and analytics
6. Final UI/UX polish

**Key Deliverables:**
- Production-ready application
- Comprehensive test coverage
- Deployment setup
- Performance monitoring

## Critical Implementation Details

### Database Schema
Use the complete PostgreSQL schema provided in the specification. Pay special attention to:
- User and repository relationships
- Burnout metrics calculation and storage
- Team insights aggregation
- Proper indexing for performance

### Burnout Prediction Algorithm
Implement the sophisticated burnout detection system:

```typescript
// Core burnout factors to analyze
interface BurnoutFactors {
  workHoursPattern: number;      // 0-1 (normal to excessive)
  codeQualityTrend: number;      // 0-1 (improving to declining)  
  collaborationLevel: number;    // 0-1 (high to low)
  workloadDistribution: number;  // 0-1 (balanced to overloaded)
  timeToResolution: number;      // 0-1 (fast to slow)
  weekendWorkFrequency: number;  // 0-1 (never to always)
}

// Weighted risk calculation
function calculateBurnoutRisk(factors: BurnoutFactors): number {
  const weights = {
    workHoursPattern: 0.25,
    codeQualityTrend: 0.20,
    collaborationLevel: 0.15,
    workloadDistribution: 0.20,
    timeToResolution: 0.10,
    weekendWorkFrequency: 0.10
  };
  
  return Object.entries(factors).reduce((risk, [factor, value]) => {
    return risk + (value * weights[factor]);
  }, 0) * 100; // Scale to 0-100
}
```

### GitHub API Integration
Implement efficient data collection with:
- Rate limiting consideration (5000 requests/hour)
- Exponential backoff for failed requests
- Incremental sync strategy
- Data caching for performance

### AI Features Implementation
1. **Burnout Prediction**: Multi-factor analysis with confidence scoring
2. **Auto-Retrospectives**: AI-generated team insights and recommendations
3. **Smart Recommendations**: Contextual suggestions for improvement
4. **Pattern Recognition**: Behavioral analysis and trend detection

## UI/UX Requirements

### Design System
- Clean, modern interface with subtle animations
- Consistent color palette (blues, greens, with warning/error states)
- Interactive charts with hover states and tooltips
- Responsive design for desktop and mobile

### Key Components to Build
1. **BurnoutRadar**: Central risk assessment display
2. **ProductivityTimeline**: Interactive productivity visualization
3. **TeamCollaborationNetwork**: Team interaction visualization
4. **AutoRetrospective**: AI-generated retrospective display
5. **AlertSystem**: Smart notifications and recommendations

## Quality Standards

### Code Quality
- TypeScript throughout with proper typing
- Clean, maintainable architecture
- Proper error handling and edge cases
- Comprehensive commenting for complex logic

### Performance
- Page load times under 2 seconds
- API responses under 500ms
- Efficient database queries with proper indexing
- Optimized chart rendering

### Testing
- Unit tests for core algorithms
- Integration tests for API endpoints
- Component testing for UI elements
- End-to-end testing for critical user flows

## Agent Orchestration Showcase

### Spec-to-Code Excellence
- Complex database relationships → Clean Prisma models
- Advanced analytics specifications → Accurate implementations
- Multi-layered architecture → Proper separation of concerns

### Code Generation Mastery
- Interactive visualizations → Beautiful D3.js components
- Complex React state management → Clean, efficient components
- API endpoint logic → Robust, scalable implementations

### Agent Hooks Implementation
- Continuous data sync → Automated pipeline optimization
- Performance monitoring → Auto-scaling adjustments
- Error detection → Automated recovery systems

## Success Criteria

### Technical Achievement
- All features implemented according to specification
- Production-ready code quality
- Comprehensive test coverage
- Successful deployment

### Innovation Showcase
- Sophisticated AI integration
- Beautiful, interactive user experience
- Meaningful insights that solve real problems
- Scalable architecture for future growth

### Demo Impact
- Clear demonstration of burnout prediction accuracy
- Compelling before/after productivity improvements
- Smooth, responsive user interface
- Impressive technical architecture

## Final Deliverables

1. **Complete Application**: Fully functional DevPulse platform
2. **Source Code**: Clean, well-documented codebase
3. **Documentation**: Implementation details and API documentation
4. **Test Suite**: Comprehensive testing coverage
5. **Deployment Setup**: Production-ready deployment configuration

## Special Instructions

### Agent Hooks Integration
Throughout development, leverage agent hooks for:
- **Continuous Testing**: Auto-test after each major change
- **Performance Monitoring**: Track and optimize performance metrics
- **Code Quality**: Maintain high standards through automated checks
- **Deployment Pipeline**: Seamless staging and production deployment

### AI Integration Best Practices
- Use OpenAI API efficiently with proper rate limiting
- Implement fallback mechanisms for AI failures
- Cache AI responses appropriately
- Provide confidence scoring for AI predictions

### GitHub API Optimization
- Implement smart caching strategies
- Use webhook notifications where possible
- Batch API calls for efficiency
- Handle rate limiting gracefully

Remember: This is not just about building features, but showcasing sophisticated AI agent orchestration that results in production-quality software. Every component should demonstrate thoughtful engineering, not just functional code.

Build something that judges will remember - a platform that genuinely helps developers while showcasing the future of AI-assisted development.