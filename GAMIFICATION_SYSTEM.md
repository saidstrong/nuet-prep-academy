# 🏆 Gamification System

A comprehensive gamification system for the NUET Prep Academy that makes learning engaging, motivating, and fun through badges, achievements, points, levels, and leaderboards.

## 🚀 Features

### 🎯 **Points & Experience System**
- **Earn Points**: Complete courses, tests, study materials, and daily activities
- **Level Up**: Gain experience points to advance through levels
- **Point Categories**: Different activities award different point values
- **Transaction History**: Track all point earnings and deductions

### 🏅 **Badge System**
- **Course Completion Badges**: Reward for finishing courses
- **Test Performance Badges**: Recognition for high test scores
- **Study Time Badges**: Acknowledge dedicated study sessions
- **Streak Badges**: Celebrate consistent daily engagement
- **Social Badges**: Encourage community participation
- **Special Badges**: Unique achievements for exceptional performance

### 🎖️ **Achievement System**
- **Academic Achievements**: High test scores and course completion
- **Engagement Achievements**: Consistent participation and study habits
- **Milestone Achievements**: Reaching significant point and level thresholds
- **Special Achievements**: Unique challenges and accomplishments

### 🔥 **Streak System**
- **Daily Login Streaks**: Consecutive days of platform engagement
- **Streak Bonuses**: Extra points for maintaining streaks
- **Streak Leaderboards**: Compete for longest streaks
- **Visual Streak Indicators**: Flame icons showing current streak

### 📊 **Leaderboards**
- **Points Leaderboard**: Overall ranking by total points
- **Course Completion**: Most courses completed
- **Test Scores**: Highest average test performance
- **Study Time**: Most hours spent studying
- **Streak**: Longest daily login streaks
- **Real-time Updates**: Live rankings and competition

### 📈 **Progress Tracking**
- **Level Progress**: Visual progress bars to next level
- **Experience Points**: Detailed XP tracking and requirements
- **Activity History**: Recent point transactions and achievements
- **Performance Analytics**: Study time, test scores, and completion rates

## 🏗️ Architecture

### Database Models
- **`Badge`**: Badge definitions and criteria
- **`UserBadge`**: User-badge relationships and earning dates
- **`Achievement`**: Achievement definitions and criteria
- **`UserAchievement`**: User-achievement relationships
- **`UserPoints`**: User points, levels, experience, and streaks
- **`PointTransaction`**: Detailed point transaction history
- **`Leaderboard`**: Leaderboard definitions and categories
- **`LeaderboardEntry`**: Individual leaderboard rankings

### Core Service
- **`GamificationService`**: Central service handling all gamification logic
- **Automatic Triggers**: Points and badges awarded automatically
- **Real-time Updates**: Immediate feedback on achievements
- **Performance Optimization**: Efficient database queries and caching

### Frontend Components
- **`GamificationDashboard`**: Main dashboard with tabs and navigation
- **Interactive UI**: Responsive design with smooth animations
- **Real-time Data**: Live updates of points, badges, and rankings
- **Mobile Optimized**: Works seamlessly on all devices

## 🔧 Setup Instructions

### 1. Database Migration
Run the following command to apply the new schema changes:
```bash
npx prisma migrate dev --name add-gamification-system
```

### 2. Seed the System
Populate the system with initial badges and achievements:
```bash
npx tsx prisma/gamification-seed.ts
```

### 3. Environment Variables
No additional environment variables required beyond your existing setup.

### 4. Integration Points
The gamification system automatically integrates with:
- Course completion tracking
- Test submission and scoring
- Material progress monitoring
- User login and session management

## 📱 Usage

### Accessing Gamification
1. **Login to Platform**: Navigate to `/gamification`
2. **View Dashboard**: See your points, level, and recent activity
3. **Explore Tabs**: Switch between Overview, Badges, Achievements, and Leaderboards
4. **Track Progress**: Monitor your advancement and upcoming milestones

### Earning Points

#### Course Activities
- **Course Completion**: 500 points per completed course
- **Material Study**: 10 points per hour of study time
- **Test Performance**: 25-100 points based on score (60%+ = 25, 70%+ = 50, 80%+ = 75, 90%+ = 100)

#### Daily Activities
- **Daily Login**: 10 points for consecutive days
- **Streak Bonus**: Up to 100 points for maintaining streaks
- **Badge Earning**: Points vary by badge (100-1000 points)

#### Special Achievements
- **Perfect Scores**: Bonus points for 100% test results
- **Early Completion**: Rewards for finishing courses quickly
- **Consistent Performance**: Recognition for sustained excellence

### Leveling System
- **Level 1**: 0-999 XP
- **Level 2**: 1000-1999 XP
- **Level 3**: 2000-2999 XP
- **And so on...**

Each level requires 1000 experience points, with progress bars showing advancement.

## 🎯 Badge Categories

### Course Completion
- **First Steps**: Complete your first course
- **Course Master**: Complete 5 courses
- **Speed Learner**: Complete courses quickly

### Test Performance
- **Perfect Score**: Achieve 100% on tests
- **Excellence**: Maintain 90%+ average
- **Consistent Performer**: Regular test participation

### Study Time
- **Dedicated Learner**: 10+ hours of study
- **Study Champion**: 50+ hours of study
- **Knowledge Seeker**: Regular material access

### Streaks
- **Streak Master**: 7-day login streak
- **Unstoppable**: 30-day login streak
- **Weekend Warrior**: Weekend study consistency

### Social & Special
- **Social Butterfly**: Community participation
- **Early Bird**: Quick course completion
- **Night Owl**: Late-night study sessions

## 🏆 Achievement System

### Academic Achievements
- **Academic Excellence**: 95%+ test average
- **Knowledge Master**: Comprehensive course completion
- **Test Champion**: Consistent high performance

### Engagement Achievements
- **Speed Learner**: Rapid course completion
- **Consistent Performer**: Regular platform usage
- **Knowledge Seeker**: Active learning participation

### Milestone Achievements
- **Milestone Reacher**: 1000+ total points
- **Level Up Master**: Reach level 10
- **Point Collector**: Accumulate significant points

### Special Achievements
- **Weekend Warrior**: Weekend study consistency
- **Night Owl**: Late-night study patterns
- **Early Bird**: Quick course completion

## 📊 Leaderboard Categories

### Points Leaderboard
- **Ranking**: By total accumulated points
- **Updates**: Real-time as points are earned
- **Scope**: All-time ranking

### Course Completion
- **Ranking**: By number of completed courses
- **Updates**: When courses are finished
- **Scope**: All-time ranking

### Test Scores
- **Ranking**: By average test performance
- **Updates**: After each test submission
- **Scope**: All-time ranking

### Study Time
- **Ranking**: By total study hours
- **Updates**: As study time is logged
- **Scope**: All-time ranking

### Streak
- **Ranking**: By current login streak
- **Updates**: Daily based on login activity
- **Scope**: Current active streaks

## 🔒 Security Features

### Authentication
- Session-based authentication required
- User can only access their own data
- Secure API endpoints with role validation

### Data Privacy
- Personal information protected
- Anonymous leaderboard entries
- Secure point transaction logging

### Anti-Cheating
- Server-side point validation
- Transaction audit trails
- Automatic fraud detection

## 🚀 Performance Optimizations

### Database Efficiency
- Optimized Prisma queries
- Proper indexing on key fields
- Efficient relationship handling

### Caching Strategy
- Leaderboard caching
- User profile caching
- Real-time updates

### Scalability
- Horizontal scaling support
- Efficient leaderboard updates
- Optimized badge checking

## 🛠️ Customization

### Adding New Badges
1. **Define Criteria**: Set achievement requirements
2. **Create Badge**: Add to database with icon and points
3. **Update Service**: Add evaluation logic
4. **Test Integration**: Verify automatic awarding

### Custom Point Values
1. **Modify Service**: Update point calculation logic
2. **Adjust Categories**: Change point values by activity
3. **Update UI**: Reflect new point structures

### New Leaderboards
1. **Create Model**: Add new leaderboard category
2. **Update Service**: Add ranking logic
3. **Modify UI**: Display new leaderboard data

## 🔍 Troubleshooting

### Common Issues

#### No Points Awarded
- Check user authentication
- Verify activity completion
- Review point calculation logic

#### Badges Not Unlocking
- Verify achievement criteria
- Check user progress data
- Review badge evaluation logic

#### Leaderboard Not Updating
- Check leaderboard update triggers
- Verify ranking calculation
- Review database connections

### Debug Mode
Enable detailed logging in the gamification service:
```typescript
console.log('Point calculation:', { userId, activity, points });
console.log('Badge evaluation:', { userId, badge, criteria, result });
```

## 🚀 Future Enhancements

### Planned Features
- **Real-time Notifications**: Instant achievement alerts
- **Social Features**: Share achievements and compete with friends
- **Custom Badges**: User-created achievement systems
- **Seasonal Events**: Time-limited challenges and rewards
- **Team Competitions**: Group leaderboards and challenges

### Integration Opportunities
- **Push Notifications**: Mobile achievement alerts
- **Email Campaigns**: Achievement celebration emails
- **Social Media**: Share achievements externally
- **Analytics Dashboard**: Detailed performance insights
- **Gamification Reports**: Progress and achievement analytics

## 📚 API Reference

### GET `/api/gamification/profile`
Returns comprehensive gamification data for the authenticated user.

#### Response Format
```typescript
{
  points: {
    id: string;
    points: number;
    level: number;
    experience: number;
    streak: number;
    lastLogin: string;
  };
  badges: Array<{
    id: string;
    earnedAt: string;
    badge: {
      id: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      points: number;
    };
  }>;
  achievements: Array<{
    id: string;
    earnedAt: string;
    achievement: {
      id: string;
      name: string;
      description: string;
      icon: string;
      category: string;
      points: number;
    };
  }>;
  recentTransactions: Array<{
    id: string;
    points: number;
    reason: string;
    category: string;
    createdAt: string;
  }>;
  leaderboards: {
    points: LeaderboardEntry[];
    courseCompletion: LeaderboardEntry[];
    testScores: LeaderboardEntry[];
    studyTime: LeaderboardEntry[];
    streak: LeaderboardEntry[];
  };
}
```

## 🤝 Contributing

### Development Guidelines
1. **Follow TypeScript**: Maintain type safety
2. **Test Gamification Logic**: Verify point calculations and badge criteria
3. **Performance First**: Optimize database queries and caching
4. **User Experience**: Ensure smooth and engaging interactions
5. **Security**: Validate all user inputs and permissions

### Code Structure
- **Service Layer**: Core gamification logic
- **API Routes**: RESTful endpoints for data access
- **Components**: React components for UI display
- **Types**: Shared TypeScript interfaces
- **Utils**: Helper functions for calculations

---

**Built with ❤️ for NUET Prep Academy**
