import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    return NextResponse.json({
      success: true,
      env: {
        hasDatabaseUrl: !!databaseUrl,
        hasDirectUrl: !!directUrl,
        databaseUrlPrefix: databaseUrl?.substring(0, 30),
        directUrlPrefix: directUrl?.substring(0, 30),
        nodeEnv: process.env.NODE_ENV
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
