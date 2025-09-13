import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding gamification system...');

  // Create badges
  const badges = [
    {
      name: 'First Steps',
      description: 'Complete your first course',
      icon: 'trophy',
      category: 'COURSE_COMPLETION',
      points: 100,
      criteria: { type: 'course_completion_count', value: 1, condition: 'gte' }
    },
    {
      name: 'Course Master',
      description: 'Complete 5 courses',
      icon: 'crown',
      category: 'COURSE_COMPLETION',
      points: 500,
      criteria: { type: 'course_completion_count', value: 5, condition: 'gte' }
    },
    {
      name: 'Perfect Score',
      description: 'Achieve 100% on a test',
      icon: 'star',
      category: 'TEST_PERFORMANCE',
      points: 200,
      criteria: { type: 'test_score_average', value: 100, condition: 'eq' }
    },
    {
      name: 'Excellence',
      description: 'Maintain 90%+ average on tests',
      icon: 'award',
      category: 'TEST_PERFORMANCE',
      points: 300,
      criteria: { type: 'test_score_average', value: 90, condition: 'gte' }
    },
    {
      name: 'Dedicated Learner',
      description: 'Study for 10+ hours',
      icon: 'book',
      category: 'STUDY_TIME',
      points: 150,
      criteria: { type: 'study_time_total', value: 10, condition: 'gte' }
    },
    {
      name: 'Study Champion',
      description: 'Study for 50+ hours',
      icon: 'zap',
      category: 'STUDY_TIME',
      points: 400,
      criteria: { type: 'study_time_total', value: 50, condition: 'gte' }
    },
    {
      name: 'Streak Master',
      description: 'Maintain a 7-day login streak',
      icon: 'flame',
      category: 'STREAK',
      points: 200,
      criteria: { type: 'streak_days', value: 7, condition: 'gte' }
    },
    {
      name: 'Unstoppable',
      description: 'Maintain a 30-day login streak',
      icon: 'fire',
      category: 'STREAK',
      points: 1000,
      criteria: { type: 'streak_days', value: 30, condition: 'gte' }
    },
    {
      name: 'Social Butterfly',
      description: 'Participate in 10+ chat conversations',
      icon: 'users',
      category: 'SOCIAL',
      points: 100,
      criteria: { type: 'social_interactions', value: 10, condition: 'gte' }
    },
    {
      name: 'Early Bird',
      description: 'Complete a course within the first week of enrollment',
      icon: 'calendar',
      category: 'SPECIAL',
      points: 250,
      criteria: { type: 'early_completion', value: 7, condition: 'lte' }
    }
  ];

  console.log('Creating badges...');
  for (const badge of badges) {
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

  // Create achievements
  const achievements = [
    {
      name: 'Academic Excellence',
      description: 'Achieve 95%+ average across all tests',
      icon: 'award',
      category: 'ACADEMIC',
      points: 500,
      criteria: { type: 'test_score_average', value: 95, condition: 'gte' }
    },
    {
      name: 'Speed Learner',
      description: 'Complete 3 courses in one month',
      icon: 'zap',
      category: 'ENGAGEMENT',
      points: 300,
      criteria: { type: 'monthly_course_completion', value: 3, condition: 'gte' }
    },
    {
      name: 'Consistent Performer',
      description: 'Take tests for 5 consecutive days',
      icon: 'check',
      category: 'ENGAGEMENT',
      points: 200,
      criteria: { type: 'consecutive_test_days', value: 5, condition: 'gte' }
    },
    {
      name: 'Knowledge Seeker',
      description: 'Access learning materials for 20+ days',
      icon: 'book',
      category: 'ENGAGEMENT',
      points: 250,
      criteria: { type: 'active_learning_days', value: 20, condition: 'gte' }
    },
    {
      name: 'Milestone Reacher',
      description: 'Earn 1000+ total points',
      icon: 'target',
      category: 'MILESTONE',
      points: 100,
      criteria: { type: 'total_points', value: 1000, condition: 'gte' }
    },
    {
      name: 'Level Up Master',
      description: 'Reach level 10',
      icon: 'trending',
      category: 'MILESTONE',
      points: 500,
      criteria: { type: 'user_level', value: 10, condition: 'gte' }
    },
    {
      name: 'Weekend Warrior',
      description: 'Study on 5 consecutive weekends',
      icon: 'calendar',
      category: 'SPECIAL',
      points: 300,
      criteria: { type: 'weekend_study_streak', value: 5, condition: 'gte' }
    },
    {
      name: 'Night Owl',
      description: 'Study after 10 PM for 7 consecutive days',
      icon: 'moon',
      category: 'SPECIAL',
      points: 400,
      criteria: { type: 'night_study_streak', value: 7, condition: 'gte' }
    }
  ];

  console.log('Creating achievements...');
  for (const achievement of achievements) {
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

  // Create leaderboards
  const leaderboards = [
    {
      name: 'Points Leaderboard',
      description: 'Overall points ranking',
      category: 'POINTS',
      timeFrame: 'ALL_TIME'
    },
    {
      name: 'Course Completion Leaderboard',
      description: 'Most courses completed',
      category: 'COURSE_COMPLETION',
      timeFrame: 'ALL_TIME'
    },
    {
      name: 'Test Scores Leaderboard',
      description: 'Highest test score averages',
      category: 'TEST_SCORES',
      timeFrame: 'ALL_TIME'
    },
    {
      name: 'Study Time Leaderboard',
      description: 'Most study hours logged',
      category: 'STUDY_TIME',
      timeFrame: 'ALL_TIME'
    },
    {
      name: 'Streak Leaderboard',
      description: 'Longest daily login streaks',
      category: 'STREAK',
      timeFrame: 'ALL_TIME'
    }
  ];

  console.log('Creating leaderboards...');
  for (const leaderboard of leaderboards) {
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

  console.log('✅ Gamification system seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding gamification system:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
