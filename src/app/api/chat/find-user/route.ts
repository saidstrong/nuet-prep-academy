import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: 'No email provided' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: { select: { avatar: true } }
      }
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, user: { ...user, avatar: user.profile?.avatar || null } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
