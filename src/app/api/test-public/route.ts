import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Public test API called');
    
    return NextResponse.json({
      success: true,
      message: 'Public API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error: any) {
    console.error('❌ Error in public test API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message
      },
      { status: 500 }
    );
  }
}
