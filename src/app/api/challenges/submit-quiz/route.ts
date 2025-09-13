import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GamificationService } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { challengeId, answers } = await request.json();
    
    if (!challengeId || !answers) {
      return NextResponse.json({ error: 'Challenge ID and answers are required' }, { status: 400 });
    }

    // Get the challenge with quiz data
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (!challenge.hasQuiz || !challenge.quiz) {
      return NextResponse.json({ error: 'This challenge does not have a quiz' }, { status: 400 });
    }

    // Check if user has already submitted
    const existingSubmission = await prisma.challengeSubmission.findFirst({
      where: {
        challengeId,
        userId: session.user.id
      }
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'You have already submitted this challenge' }, { status: 400 });
    }

    // Score the quiz
    let correctAnswers = 0;
    const quiz = challenge.quiz as any;
    const questions = quiz.questions || [];

    questions.forEach((question: any) => {
      const userAnswer = answers[question.id];
      if (userAnswer) {
        if (question.type === 'multiple-choice' || question.type === 'true-false') {
          if (userAnswer === question.correctAnswer) {
            correctAnswers++;
          }
        } else if (question.type === 'short-answer') {
          // For short answer, check if the answer contains key words (simple matching)
          const correctAnswerLower = question.correctAnswer.toLowerCase();
          const userAnswerLower = userAnswer.toLowerCase();
          if (userAnswerLower.includes(correctAnswerLower) || correctAnswerLower.includes(userAnswerLower)) {
            correctAnswers++;
          }
        }
      }
    });

    const score = Math.round((correctAnswers / questions.length) * quiz.totalPoints);
    const passed = score >= quiz.passingScore;

    // Create submission
    const submission = await prisma.challengeSubmission.create({
      data: {
        challengeId,
        userId: session.user.id,
        content: answers,
        score
      }
    });

    // Award points if passed
    const rewards = challenge.rewards as any;
    if (passed && rewards?.points) {
      await GamificationService.awardPoints(
        session.user.id,
        rewards.points,
        'CHALLENGE_COMPLETION',
        `Completed challenge: ${challenge.name}`,
        {
          challengeId,
          challengeName: challenge.name,
          score,
          totalPoints: quiz.totalPoints
        }
      );
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score,
        totalPoints: quiz.totalPoints,
        passed,
        correctAnswers,
        totalQuestions: questions.length
      }
    });

  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
