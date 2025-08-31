import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'NextAuth test endpoint is working',
      timestamp: new Date().toISOString(),
      note: 'This endpoint is accessible, so NextAuth routing is working'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'NextAuth test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
