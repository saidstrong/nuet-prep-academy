import { prisma } from './prisma';

export interface BadgeCriteria {
  type: string;
  value: number;
  condition: 'gte' | 'lte' | 'eq';
}

export interface AchievementCriteria {
  type: string;
  value: number;
  condition: 'gte' | 'lte' | 'eq';
}

export interface EventRewards extends Record<string, any> {
  points: number;
  badges?: string[];
  achievements?: string[];
  specialRewards?: string[];
}

export interface ChallengeRules extends Record<string, any> {
  timeLimit?: number; // in minutes
  maxAttempts?: number;
  requiredScore?: number;
  teamSize?: number;
}

export class GamificationService {
  // Initialize user points if they don't exist
  static async initializeUserPoints(userId: string) {
    const existing = await prisma.userPoints.findUnique({
      where: { userId }
    });

    if (!existing) {
      return await prisma.userPoints.create({
        data: {
          userId,
          points: 0,
          level: 1,
          experience: 0,
          streak: 0
        }
      });
    }

    return existing;
  }

  // Award points to a user
  static async awardPoints(
    userId: string,
    points: number,
    category: string,
    reason: string,
    metadata?: any
  ) {
    // Initialize user points if needed
    await this.initializeUserPoints(userId);

    // Create point transaction
    const transaction = await prisma.pointTransaction.create({
      data: {
        userId,
        points,
        reason,
        category: category as any,
        metadata
      }
    });

    // Update user points
    const userPoints = await prisma.userPoints.update({
      where: { userId },
      data: {
        points: {
          increment: points
        },
        experience: {
          increment: Math.abs(points)
        }
      }
    });

    // Check for level up
    const newLevel = this.calculateLevel(userPoints.experience);
    if (newLevel > userPoints.level) {
      await prisma.userPoints.update({
        where: { userId },
        data: { level: newLevel }
      });
    }

    return { transaction, userPoints };
  }

  // Calculate user level based on experience
  static calculateLevel(experience: number): number {
    // Simple level calculation: every 1000 experience = 1 level
    return Math.floor(experience / 1000) + 1;
  }

  // Check and award daily login streak
  static async checkDailyLogin(userId: string) {
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    });

    if (!userPoints) {
      await this.initializeUserPoints(userId);
      return;
    }

    const now = new Date();
    const lastLogin = new Date(userPoints.lastLogin);
    const daysSinceLastLogin = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = userPoints.streak;
    let streakBonus = 0;

    if (daysSinceLastLogin === 1) {
      // Consecutive day
      newStreak += 1;
      streakBonus = Math.min(newStreak * 10, 100); // Max 100 points per day
    } else if (daysSinceLastLogin > 1) {
      // Streak broken
      newStreak = 1;
    }

    // Update streak and last login
    await prisma.userPoints.update({
      where: { userId },
      data: {
        streak: newStreak,
        lastLogin: now
      }
    });

    // Award streak bonus if applicable
    if (streakBonus > 0) {
      await this.awardPoints(
        userId,
        streakBonus,
        'STREAK_BONUS',
        `Daily Login Streak (${newStreak} days)`,
        { streak: newStreak }
      );
    }

    return { newStreak, streakBonus };
  }

  // Check and award course completion badge
  static async checkCourseCompletion(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        topics: {
          include: {
            materials: true,
            tests: {
              include: {
                submissions: {
                  where: { studentId: userId }
                }
              }
            }
          }
        }
      }
    });

    if (!course) return;

    const totalMaterials = course.topics.reduce(
      (sum, topic) => sum + topic.materials.length,
      0
    );
    const totalTests = course.topics.reduce(
      (sum, topic) => sum + topic.tests.length,
      0
    );

    const completedMaterials = await prisma.materialProgress.count({
      where: {
        studentId: userId,
        status: 'COMPLETED',
        material: {
          topic: {
            courseId
          }
        }
      }
    });

    const completedTests = await prisma.testSubmission.count({
      where: {
        studentId: userId,
        test: {
          topic: {
            courseId
          }
        }
      }
    });

    // Check if course is completed (all materials and tests)
    if (completedMaterials >= totalMaterials && completedTests >= totalTests) {
      // Award course completion points
      await this.awardPoints(
        userId,
        500,
        'COURSE_COMPLETION',
        `Course Completed: ${course.title}`,
        { courseId, courseTitle: course.title }
      );

      // Check for course completion badge
      await this.checkBadgeEligibility(userId, 'COURSE_COMPLETION', {
        courseId,
        courseTitle: course.title
      });
    }
  }

  // Check and award test performance badges
  static async checkTestPerformance(
    userId: string,
    testId: string,
    score: number
  ) {
    // Award points based on score
    let points = 0;
    if (score >= 90) points = 100;
    else if (score >= 80) points = 75;
    else if (score >= 70) points = 50;
    else if (score >= 60) points = 25;

    if (points > 0) {
      await this.awardPoints(
        userId,
        points,
        'TEST_PERFORMANCE',
        `Test Performance: ${score}%`,
        { testId, score }
      );
    }

    // Check for test performance badges
    if (score >= 90) {
      await this.checkBadgeEligibility(userId, 'TEST_PERFORMANCE', {
        testId,
        score,
        type: 'EXCELLENT'
      });
    } else if (score >= 80) {
      await this.checkBadgeEligibility(userId, 'TEST_PERFORMANCE', {
        testId,
        score,
        type: 'GOOD'
      });
    }
  }

  // Check and award study time badges
  static async checkStudyTime(userId: string, materialId: string) {
    const progress = await prisma.materialProgress.findUnique({
      where: {
        materialId_studentId: {
          materialId,
          studentId: userId
        }
      }
    });

    if (progress && progress.timeSpent > 0) {
      const hours = progress.timeSpent / 3600;

      // Award points for study time
      const points = Math.floor(hours * 10); // 10 points per hour
      if (points > 0) {
        await this.awardPoints(
          userId,
          points,
          'STUDY_TIME',
          `Study Time: ${hours.toFixed(1)} hours`,
          { materialId, hours, timeSpent: progress.timeSpent }
        );
      }

      // Check for study time badges
      if (hours >= 10) {
        await this.checkBadgeEligibility(userId, 'STUDY_TIME', {
          materialId,
          hours,
          type: 'DEDICATED_LEARNER'
        });
      }
    }
  }

  // Check if user is eligible for a badge
  static async checkBadgeEligibility(
    userId: string,
    category: string,
    metadata: any
  ) {
    const badges = await prisma.badge.findMany({
      where: {
        category: category as any,
        isActive: true
      }
    });

    for (const badge of badges) {
      const criteria = badge.criteria as any;
      if (criteria && typeof criteria === 'object' && 'type' in criteria) {
        const badgeCriteria: BadgeCriteria = {
          type: criteria.type,
          value: criteria.value,
          condition: criteria.condition
        };
        
        const isEligible = await this.evaluateBadgeCriteria(
          userId,
          badgeCriteria,
          metadata
        );

        if (isEligible) {
          await this.awardBadge(userId, badge.id);
        }
      }
    }
  }

  // Evaluate badge criteria
  static async evaluateBadgeCriteria(
    userId: string,
    criteria: BadgeCriteria,
    metadata: any
  ): Promise<boolean> {
    switch (criteria.type) {
      case 'course_completion_count':
        const completedCourses = await prisma.courseEnrollment.count({
          where: {
            studentId: userId,
            status: 'ACTIVE'
          }
        });
        return this.compareValues(completedCourses, criteria.value, criteria.condition);

      case 'test_score_average':
        const submissions = await prisma.testSubmission.findMany({
          where: { studentId: userId }
        });
        if (submissions.length === 0) return false;
        const avgScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / submissions.length;
        return this.compareValues(avgScore, criteria.value, criteria.condition);

      case 'study_time_total':
        const totalStudyTime = await prisma.materialProgress.aggregate({
          where: { studentId: userId },
          _sum: { timeSpent: true }
        });
        const totalHours = (totalStudyTime._sum.timeSpent || 0) / 3600;
        return this.compareValues(totalHours, criteria.value, criteria.condition);

      case 'streak_days':
        const userPoints = await prisma.userPoints.findUnique({
          where: { userId }
        });
        if (!userPoints) return false;
        return this.compareValues(userPoints.streak, criteria.value, criteria.condition);

      default:
        return false;
    }
  }

  // Compare values based on condition
  static compareValues(actual: number, expected: number, condition: string): boolean {
    switch (condition) {
      case 'gte':
        return actual >= expected;
      case 'lte':
        return actual <= expected;
      case 'eq':
        return actual === expected;
      default:
        return false;
    }
  }

  // Award a badge to a user
  static async awardBadge(userId: string, badgeId: string) {
    // Check if user already has this badge
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId
        }
      }
    });

    if (existing) return existing;

    // Award the badge
    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId
      },
      include: {
        badge: true
      }
    });

    // Award points for earning the badge
    if (userBadge.badge.points > 0) {
      await this.awardPoints(
        userId,
        userBadge.badge.points,
        'BADGE_EARNED',
        `Badge Earned: ${userBadge.badge.name}`,
        { badgeId, badgeName: userBadge.badge.name }
      );
    }

    return userBadge;
  }

  // Get user's gamification profile
  static async getUserProfile(userId: string) {
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId }
    });

    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true }
    });

    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true }
    });

    const recentTransactions = await prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      points: userPoints,
      badges,
      achievements,
      recentTransactions
    };
  }

  // Get leaderboard data
  static async getLeaderboard(
    category: string = 'POINTS',
    timeFrame: string = 'ALL_TIME',
    limit: number = 50
  ) {
    const leaderboard = await prisma.leaderboard.findFirst({
      where: {
        category: category as any,
        timeFrame: timeFrame as any,
        isActive: true
      }
    });

    if (!leaderboard) return [];

    const entries = await prisma.leaderboardEntry.findMany({
      where: { leaderboardId: leaderboard.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { rank: 'asc' },
      take: limit
    });

    return entries;
  }

  // Update leaderboards
  static async updateLeaderboards() {
    // Update points leaderboard
    await this.updatePointsLeaderboard();
    
    // Update course completion leaderboard
    await this.updateCourseCompletionLeaderboard();
    
    // Update test scores leaderboard
    await this.updateTestScoresLeaderboard();
    
    // Update study time leaderboard
    await this.updateStudyTimeLeaderboard();
    
    // Update streak leaderboard
    await this.updateStreakLeaderboard();
  }

  // Update points leaderboard
  static async updatePointsLeaderboard() {
    const users = await prisma.userPoints.findMany({
      orderBy: { points: 'desc' },
      take: 100
    });

    const leaderboard = await this.getOrCreateLeaderboard('POINTS', 'ALL_TIME');

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_leaderboardId: {
            userId: user.userId,
            leaderboardId: leaderboard.id
          }
        },
        update: {
          rank: i + 1,
          score: user.points
        },
        create: {
          userId: user.userId,
          leaderboardId: leaderboard.id,
          rank: i + 1,
          score: user.points
        }
      });
    }
  }

  // Get or create a leaderboard
  static async getOrCreateLeaderboard(category: string, timeFrame: string) {
    let leaderboard = await prisma.leaderboard.findFirst({
      where: {
        category: category as any,
        timeFrame: timeFrame as any
      }
    });

    if (!leaderboard) {
      leaderboard = await prisma.leaderboard.create({
        data: {
          name: `${category} ${timeFrame}`,
          description: `${category} leaderboard for ${timeFrame}`,
          category: category as any,
          timeFrame: timeFrame as any
        }
      });
    }

    return leaderboard;
  }

  // Update course completion leaderboard
  static async updateCourseCompletionLeaderboard() {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentEnrollments: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    const userStats = users.map(user => ({
      userId: user.id,
      completedCourses: user.studentEnrollments.length
    }));

    userStats.sort((a, b) => b.completedCourses - a.completedCourses);

    const leaderboard = await this.getOrCreateLeaderboard('COURSE_COMPLETION', 'ALL_TIME');

    for (let i = 0; i < userStats.length; i++) {
      const user = userStats[i];
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_leaderboardId: {
            userId: user.userId,
            leaderboardId: leaderboard.id
          }
        },
        update: {
          rank: i + 1,
          score: user.completedCourses
        },
        create: {
          userId: user.userId,
          leaderboardId: leaderboard.id,
          rank: i + 1,
          score: user.completedCourses
        }
      });
    }
  }

  // Update test scores leaderboard
  static async updateTestScoresLeaderboard() {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        testSubmissions: true
      }
    });

    const userStats = users
      .map(user => {
        if (user.testSubmissions.length === 0) return null;
        const avgScore = user.testSubmissions.reduce(
          (sum, sub) => sum + (sub.score || 0),
          0
        ) / user.testSubmissions.length;
        return {
          userId: user.id,
          avgScore: Math.round(avgScore)
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.avgScore - a!.avgScore);

    const leaderboard = await this.getOrCreateLeaderboard('TEST_SCORES', 'ALL_TIME');

    for (let i = 0; i < userStats.length; i++) {
      const user = userStats[i]!;
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_leaderboardId: {
            userId: user.userId,
            leaderboardId: leaderboard.id
          }
        },
        update: {
          rank: i + 1,
          score: user.avgScore
        },
        create: {
          userId: user.userId,
          leaderboardId: leaderboard.id,
          rank: i + 1,
          score: user.avgScore
        }
      });
    }
  }

  // Update study time leaderboard
  static async updateStudyTimeLeaderboard() {
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        materialProgress: true
      }
    });

    const userStats = users.map(user => {
      const totalTime = user.materialProgress.reduce(
        (sum, progress) => sum + progress.timeSpent,
        0
      );
      return {
        userId: user.id,
        totalHours: Math.round(totalTime / 3600)
      };
    });

    userStats.sort((a, b) => b.totalHours - a.totalHours);

    const leaderboard = await this.getOrCreateLeaderboard('STUDY_TIME', 'ALL_TIME');

    for (let i = 0; i < userStats.length; i++) {
      const user = userStats[i];
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_leaderboardId: {
            userId: user.userId,
            leaderboardId: leaderboard.id
          }
        },
        update: {
          rank: i + 1,
          score: user.totalHours
        },
        create: {
          userId: user.userId,
          leaderboardId: leaderboard.id,
          rank: i + 1,
          score: user.totalHours
        }
      });
    }
  }

  // Update streak leaderboard
  static async updateStreakLeaderboard() {
    const users = await prisma.userPoints.findMany({
      orderBy: { streak: 'desc' },
      take: 100
    });

    const leaderboard = await this.getOrCreateLeaderboard('STREAK', 'ALL_TIME');

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_leaderboardId: {
            userId: user.userId,
            leaderboardId: leaderboard.id
          }
        },
        update: {
          rank: i + 1,
          score: user.streak
        },
        create: {
          userId: user.userId,
          leaderboardId: leaderboard.id,
          rank: i + 1,
          score: user.streak
        }
      });
    }
  }

  // Social Features
  static async shareAchievement(
    userId: string,
    achievementId: string,
    message?: string,
    receiverId?: string
  ) {
    const achievement = await prisma.userAchievement.findUnique({
      where: { id: achievementId },
      include: { achievement: true }
    });

    if (!achievement) {
      throw new Error('Achievement not found');
    }

    // Create social interaction
    const interaction = await prisma.socialInteraction.create({
      data: {
        type: 'ACHIEVEMENT_SHARE',
        content: message || `I just earned the ${achievement.achievement.name} achievement!`,
        metadata: {
          achievementId: achievement.id,
          achievementName: achievement.achievement.name,
          points: achievement.achievement.points
        },
        userId,
        receiverId,
        isPublic: !receiverId
      }
    });

    // Award points for social sharing
    await this.awardPoints(userId, 10, 'SOCIAL_INTERACTION', 'Sharing achievement');

    return interaction;
  }

  static async shareBadge(
    userId: string,
    badgeId: string,
    message?: string,
    receiverId?: string
  ) {
    const userBadge = await prisma.userBadge.findUnique({
      where: { id: badgeId },
      include: { badge: true }
    });

    if (!userBadge) {
      throw new Error('Badge not found');
    }

    const interaction = await prisma.socialInteraction.create({
      data: {
        type: 'BADGE_SHARE',
        content: message || `I just earned the ${userBadge.badge.name} badge!`,
        metadata: {
          badgeId: userBadge.id,
          badgeName: userBadge.badge.name,
          points: userBadge.badge.points
        },
        userId,
        receiverId,
        isPublic: !receiverId
      }
    });

    await this.awardPoints(userId, 10, 'SOCIAL_INTERACTION', 'Sharing badge');

    return interaction;
  }

  static async sendFriendRequest(userId: string, friendEmail: string, message?: string) {
    const friend = await prisma.user.findUnique({
      where: { email: friendEmail }
    });

    if (!friend) {
      throw new Error('User not found');
    }

    if (userId === friend.id) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if connection already exists
    const existingConnection = await prisma.friendConnection.findFirst({
      where: {
        OR: [
          { userId, friendId: friend.id },
          { userId: friend.id, friendId: userId }
        ]
      }
    });

    if (existingConnection) {
      throw new Error('Friend connection already exists');
    }

    const connection = await prisma.friendConnection.create({
      data: {
        userId,
        friendId: friend.id,
        status: 'PENDING'
      }
    });

    // Create social interaction
    await prisma.socialInteraction.create({
      data: {
        type: 'INVITE_FRIEND',
        content: message || `I sent you a friend request!`,
        metadata: { friendId: friend.id, friendName: friend.name },
        userId,
        receiverId: friend.id,
        isPublic: false
      }
    });

    return connection;
  }

  static async acceptFriendRequest(connectionId: string, userId: string) {
    const connection = await prisma.friendConnection.findUnique({
      where: { id: connectionId }
    });

    if (!connection || connection.friendId !== userId) {
      throw new Error('Friend request not found');
    }

    if (connection.status !== 'PENDING') {
      throw new Error('Friend request already processed');
    }

    const updatedConnection = await prisma.friendConnection.update({
      where: { id: connectionId },
      data: { status: 'ACCEPTED' }
    });

    // Award points to both users
    await Promise.all([
      this.awardPoints(connection.userId, 20, 'SOCIAL_INTERACTION', 'Friend request accepted'),
      this.awardPoints(userId, 20, 'SOCIAL_INTERACTION', 'Friend request accepted')
    ]);

    return updatedConnection;
  }

  static async getFriendsList(userId: string) {
    const connections = await prisma.friendConnection.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        friend: { select: { id: true, name: true, email: true } }
      }
    });

    return connections.map(connection => {
      if (connection.userId === userId) {
        return connection.friend;
      } else {
        return connection.user;
      }
    });
  }

  // Team Features
  static async createTeam(
    userId: string,
    name: string,
    description?: string,
    logo?: string,
    maxMembers: number = 10
  ) {
    const team = await prisma.team.create({
      data: {
        name,
        description,
        logo,
        maxMembers
      }
    });

    // Add creator as team leader
    await prisma.teamMembership.create({
      data: {
        userId,
        teamId: team.id,
        role: 'LEADER'
      }
    });

    // Create team leaderboard
    await prisma.leaderboard.create({
      data: {
        name: `${name} Team Leaderboard`,
        description: `Team competition leaderboard for ${name}`,
        category: 'TEAM',
        timeFrame: 'ALL_TIME',
        isTeam: true,
        teamId: team.id
      }
    });

    return team;
  }

  static async inviteToTeam(
    teamId: string,
    invitingUserId: string,
    invitedUserEmail: string,
    message?: string
  ) {
    // Check if inviter is team member
    const membership = await prisma.teamMembership.findUnique({
      where: { userId_teamId: { userId: invitingUserId, teamId } }
    });

    if (!membership || !['LEADER', 'CO_LEADER'].includes(membership.role)) {
      throw new Error('Only team leaders can send invitations');
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: invitedUserEmail }
    });

    if (!invitedUser) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    const existingMembership = await prisma.teamMembership.findUnique({
      where: { userId_teamId: { userId: invitedUser.id, teamId } }
    });

    if (existingMembership) {
      throw new Error('User is already a team member');
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.teamInvitation.findUnique({
      where: { invitedUserId_teamId: { invitedUserId: invitedUser.id, teamId } }
    });

    if (existingInvitation) {
      throw new Error('Invitation already sent');
    }

    const invitation = await prisma.teamInvitation.create({
      data: {
        invitingUserId,
        invitedUserId: invitedUser.id,
        teamId,
        message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return invitation;
  }

  static async acceptTeamInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation || invitation.invitedUserId !== userId) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation already processed');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Add user to team
    await prisma.teamMembership.create({
      data: {
        userId,
        teamId: invitation.teamId,
        role: 'MEMBER'
      }
    });

    // Update invitation status
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' }
    });

    // Award points
    await this.awardPoints(userId, 50, 'TEAM_COMPETITION', 'Joined team');

    return { success: true };
  }

  static async getTeamMembers(teamId: string) {
    return await prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' }
      ]
    });
  }

  // Seasonal Events
  static async createSeasonalEvent(
    name: string,
    description: string,
    type: string,
    startDate: Date,
    endDate: Date,
    rules: any,
    rewards: EventRewards,
    maxParticipants?: number,
    isTeamEvent: boolean = false
  ) {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        type: type as any,
        startDate,
        endDate,
        rules,
        rewards,
        maxParticipants,
        isTeamEvent
      }
    });

    // Create event-specific leaderboard
    await prisma.leaderboard.create({
      data: {
        name: `${name} Leaderboard`,
        description: `Leaderboard for ${name} event`,
        category: 'SEASONAL',
        timeFrame: 'SEASONAL',
        eventId: event.id
      }
    });

    return event;
  }

  static async joinEvent(eventId: string, userId: string, teamId?: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'ACTIVE') {
      throw new Error('Event is not active');
    }

    // Check if user is already participating
    const existingParticipation = await prisma.eventParticipation.findUnique({
      where: { userId_eventId: { userId, eventId } }
    });

    if (existingParticipation) {
      throw new Error('Already participating in this event');
    }

    // Check participant limit
    if (event.maxParticipants) {
      const participantCount = await prisma.eventParticipation.count({
        where: { eventId }
      });

      if (participantCount >= event.maxParticipants) {
        throw new Error('Event is full');
      }
    }

    const participation = await prisma.eventParticipation.create({
      data: {
        userId,
        eventId,
        teamId
      }
    });

    // Award points for joining
    await this.awardPoints(userId, 25, 'SEASONAL_EVENT', `Joined ${event.name}`);

    return participation;
  }

  static async createChallenge(
    name: string,
    description: string,
    type: string,
    startDate: Date,
    endDate: Date,
    rules: ChallengeRules,
    rewards: any,
    eventId?: string,
    maxParticipants?: number,
    hasQuiz?: boolean,
    quiz?: any
  ) {
    return await prisma.challenge.create({
      data: {
        name,
        description,
        type: type as any,
        startDate,
        endDate,
        rules,
        rewards,
        eventId,
        maxParticipants,
        hasQuiz: hasQuiz || false,
        quiz: quiz || null
      }
    });
  }

  static async submitChallenge(
    challengeId: string,
    userId: string,
    content: string
  ) {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.startDate > new Date() || challenge.endDate < new Date()) {
      throw new Error('Challenge is not active');
    }

    // Check if user already submitted
    const existingSubmission = await prisma.challengeSubmission.findFirst({
      where: { challengeId, userId }
    });

    if (existingSubmission && (challenge.rules as any)?.maxAttempts === 1) {
      throw new Error('Challenge allows only one submission');
    }

    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId,
        userId,
        content
      }
    });

    // Award points for participation
    await this.awardPoints(userId, 15, 'SEASONAL_EVENT', `Submitted to ${challenge.name}`);

    return submission;
  }

  static async getActiveEvents() {
    const now = new Date();
    
    return await prisma.event.findMany({
      where: {
        OR: [
          { status: 'ACTIVE' },
          {
            status: 'UPCOMING',
            startDate: { lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } // Starting within 24 hours
          }
        ]
      },
      include: {
        participations: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  static async getEventLeaderboard(eventId: string, limit: number = 50) {
    const participations = await prisma.eventParticipation.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { score: 'desc' },
      take: limit
    });

    return participations.map((participation, index) => ({
      rank: index + 1,
      userId: participation.user.id,
      userName: participation.user.name,
      userImage: null, // Image field not available
      score: participation.score,
      joinedAt: participation.joinedAt
    }));
  }

  // Enhanced leaderboard methods for team competitions
  static async getTeamLeaderboard(teamId: string, category: string, timeFrame: string, limit: number = 50) {
    const leaderboard = await prisma.leaderboard.findFirst({
      where: { teamId, category: category as any, timeFrame: timeFrame as any }
    });

    if (!leaderboard) {
      return [];
    }

    const entries = await prisma.leaderboardEntry.findMany({
      where: { leaderboardId: leaderboard.id },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { score: 'desc' },
      take: limit
    });

    return entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      userName: entry.user.name,
      userImage: null, // Image field not available
      score: entry.score,
      updatedAt: entry.updatedAt
    }));
  }
}
