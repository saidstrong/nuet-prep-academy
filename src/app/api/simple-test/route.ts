import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple test without database queries
    return NextResponse.json({
      success: true,
      message: 'Simple test successful - no database queries',
      timestamp: new Date().toISOString(),
      note: 'This confirms the API routes are working'
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Simple test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
