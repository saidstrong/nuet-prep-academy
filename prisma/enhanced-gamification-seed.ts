import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding enhanced gamification system...');

  // Create enhanced badges
  const enhancedBadges = [
    {
      name: 'Social Butterfly',
      description: 'Connect with 10 friends',
      icon: 'users',
      category: 'SOCIAL',
      points: 150,
      criteria: { type: 'friend_count', value: 10, condition: 'gte' }
    },
    {
      name: 'Team Player',
      description: 'Join your first team',
      icon: 'team',
      category: 'SOCIAL',
      points: 200,
      criteria: { type: 'team_joined', value: 1, condition: 'gte' }
    },
    {
      name: 'Event Champion',
      description: 'Participate in 5 seasonal events',
      icon: 'calendar',
      category: 'SPECIAL',
      points: 300,
      criteria: { type: 'event_participation_count', value: 5, condition: 'gte' }
    },
    {
      name: 'Challenge Master',
      description: 'Complete 10 challenges',
      icon: 'target',
      category: 'SPECIAL',
      points: 250,
      criteria: { type: 'challenge_completion_count', value: 10, condition: 'gte' }
    },
    {
      name: 'Streak Legend',
      description: 'Maintain a 30-day login streak',
      icon: 'flame',
      category: 'STREAK',
      points: 500,
      criteria: { type: 'streak_days', value: 30, condition: 'gte' }
    }
  ];

  console.log('Creating enhanced badges...');
  for (const badge of enhancedBadges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category as any,
        points: badge.points,
        criteria: badge.criteria,
        isActive: true
      }
    });
  }

  // Create enhanced achievements
  const enhancedAchievements = [
    {
      name: 'Social Networker',
      description: 'Build a strong network of friends and teammates',
      icon: 'users',
      category: 'SOCIAL',
      points: 400,
      criteria: { type: 'social_interactions', value: 50, condition: 'gte' }
    },
    {
      name: 'Team Leader',
      description: 'Lead a team to victory in competitions',
      icon: 'crown',
      category: 'SOCIAL',
      points: 600,
      criteria: { type: 'team_leadership', value: 1, condition: 'gte' }
    },
    {
      name: 'Event Organizer',
      description: 'Participate in various types of seasonal events',
      icon: 'calendar',
      category: 'ENGAGEMENT',
      points: 350,
      criteria: { type: 'event_variety', value: 3, condition: 'gte' }
    },
    {
      name: 'Challenge Conqueror',
      description: 'Master different types of challenges',
      icon: 'target',
      category: 'ACADEMIC',
      points: 450,
      criteria: { type: 'challenge_variety', value: 5, condition: 'gte' }
    }
  ];

  console.log('Creating enhanced achievements...');
  for (const achievement of enhancedAchievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category as any,
        points: achievement.points,
        criteria: achievement.criteria,
        isActive: true
      }
    });
  }

  // Create enhanced leaderboards
  const enhancedLeaderboards = [
    {
      name: 'Social Interaction Leaderboard',
      description: 'Top users by social interactions and friend connections',
      category: 'SOCIAL',
      timeFrame: 'ALL_TIME'
    },
    {
      name: 'Team Competition Leaderboard',
      description: 'Top teams by performance in competitions',
      category: 'TEAM',
      timeFrame: 'ALL_TIME'
    },
    {
      name: 'Seasonal Events Leaderboard',
      description: 'Top participants in seasonal events',
      category: 'SEASONAL',
      timeFrame: 'SEASONAL'
    },
    {
      name: 'Challenge Completion Leaderboard',
      description: 'Top users by challenge completion rate',
      category: 'OVERALL',
      timeFrame: 'ALL_TIME'
    }
  ];

  console.log('Creating enhanced leaderboards...');
  for (const leaderboard of enhancedLeaderboards) {
    await prisma.leaderboard.upsert({
      where: { name: leaderboard.name },
      update: {},
      create: {
        name: leaderboard.name,
        description: leaderboard.description,
        category: leaderboard.category as any,
        timeFrame: leaderboard.timeFrame as any,
        isActive: true
      }
    });
  }

  // Create sample seasonal events
  const sampleEvents = [
    {
      name: 'Spring Learning Challenge',
      description: 'A month-long challenge to boost your learning during spring',
      type: 'SEASONAL_CHALLENGE',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-31'),
      rules: {
        minStudyTime: 2, // hours per day
        minTestsCompleted: 5,
        teamSize: 4
      },
      rewards: {
        points: 1000,
        badges: ['Spring Champion'],
        specialRewards: ['Exclusive Spring Badge']
      },
      maxParticipants: 100,
      isTeamEvent: true
    },
    {
      name: 'Weekend Quiz Marathon',
      description: 'Intensive weekend quiz sessions with rapid-fire questions',
      type: 'TIME_LIMITED_QUIZ',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-17'),
      rules: {
        timeLimit: 30, // minutes per quiz
        maxAttempts: 3,
        requiredScore: 70
      },
      rewards: {
        points: 500,
        badges: ['Weekend Warrior'],
        specialRewards: ['Speed Learner Badge']
      },
      maxParticipants: 50,
      isTeamEvent: false
    }
  ];

  console.log('Creating sample seasonal events...');
  for (const event of sampleEvents) {
    // Check if event already exists by name and description
    const existingEvent = await prisma.event.findFirst({
      where: { 
        name: event.name,
        description: event.description
      }
    });

    if (!existingEvent) {
      await prisma.event.create({
        data: {
          name: event.name,
          description: event.description,
          type: event.type as any,
          startDate: event.startDate,
          endDate: event.endDate,
          rules: event.rules,
          rewards: event.rewards,
          maxParticipants: event.maxParticipants,
          isTeamEvent: event.isTeamEvent,
          status: 'UPCOMING'
        }
      });
    }
  }

  // Create sample challenges
  const sampleChallenges = [
    {
      name: 'Daily Study Streak',
      description: 'Maintain a daily study habit for 7 consecutive days',
      type: 'INDIVIDUAL',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-03-07'),
      rules: {
        timeLimit: 1440, // 24 hours in minutes
        maxAttempts: 1,
        requiredScore: 100
      },
      rewards: {
        points: 200,
        badges: ['Consistent Learner'],
        specialRewards: ['7-Day Streak Badge']
      }
    },
    {
      name: 'Team Quiz Battle',
      description: 'Compete against other teams in a series of quiz rounds',
      type: 'TEAM',
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-03-12'),
      rules: {
        timeLimit: 60, // minutes per round
        maxAttempts: 2,
        teamSize: 4,
        requiredScore: 80
      },
      rewards: {
        points: 400,
        badges: ['Team Champion'],
        specialRewards: ['Victory Badge']
      }
    }
  ];

  console.log('Creating sample challenges...');
  for (const challenge of sampleChallenges) {
    // Check if challenge already exists by name and description
    const existingChallenge = await prisma.challenge.findFirst({
      where: { 
        name: challenge.name,
        description: challenge.description
      }
    });

    if (!existingChallenge) {
      await prisma.challenge.create({
        data: {
          name: challenge.name,
          description: challenge.description,
          type: challenge.type as any,
          startDate: challenge.startDate,
          endDate: challenge.endDate,
          rules: challenge.rules,
          rewards: challenge.rewards,
          maxParticipants: 100,
          isActive: true
        }
      });
    }
  }

  console.log('✅ Enhanced gamification system seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding enhanced gamification system:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
