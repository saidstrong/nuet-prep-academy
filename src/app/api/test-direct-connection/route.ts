import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing direct database connection...');
    
    // Use the existing prisma instance instead of creating a new one
    // This avoids the import issue
    
    // Lazy import to prevent build-time issues
    const { prisma } = await import('@/lib/prisma');
    
    try {
      // Test connection
      await prisma.$connect();
      console.log('✅ Direct connection successful');
      
      // Try a simple query to see if tables exist
      try {
        const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
        console.log('✅ Database query successful:', result);
        
        return NextResponse.json({
          success: true,
          message: 'Direct database connection working!',
          databaseInfo: result,
          timestamp: new Date().toISOString(),
          note: 'Database is accessible, tables might not exist yet'
        });
        
      } catch (queryError: any) {
        console.log('⚠️ Query failed, but connection works:', queryError.message);
        
        return NextResponse.json({
          success: true,
          message: 'Connection works but query failed',
          error: queryError.message,
          timestamp: new Date().toISOString(),
          note: 'This suggests tables don\'t exist yet'
        });
      }
      
    } catch (connectionError: any) {
      console.error('❌ Direct connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Direct connection failed',
        error: connectionError.message,
        timestamp: new Date().toISOString(),
        note: 'Check if Supabase is accessible and credentials are correct'
      });
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Direct connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Direct connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
