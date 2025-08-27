import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing direct Supabase connection (port 5432)...');
    
    // Create a direct connection to Supabase (bypassing the pooler)
    const { PrismaClient } = await import('@prisma/client');
    
    // Build direct connection URL (port 5432, no pooler)
    const directUrl = "postgresql://postgres:Saltanat_1980@db.mokrzgcbweenzmxlkcoo.supabase.co:5432/postgres?sslmode=require";
    
    console.log('🔗 Testing direct connection URL:', directUrl.substring(0, 50) + '...');
    
    // Create a new Prisma client with direct connection
    const directPrisma = new PrismaClient({
      datasources: {
        db: {
          url: directUrl,
        },
      },
      log: ['error'],
    });
    
    try {
      // Test connection
      await directPrisma.$connect();
      console.log('✅ Direct Supabase connection successful!');
      
      // Try a simple query
      const result = await directPrisma.$queryRaw`SELECT current_database(), current_user, version()`;
      console.log('✅ Database query successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Direct Supabase connection working!',
        databaseInfo: result,
        connectionType: 'Direct (port 5432)',
        connectionUrl: directUrl.substring(0, 50) + '...',
        timestamp: new Date().toISOString(),
        note: 'Database is accessible via direct connection - now we can create tables!'
      });
      
    } catch (connectionError: any) {
      console.error('❌ Direct Supabase connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Direct Supabase connection failed',
        error: connectionError.message,
        connectionType: 'Direct (port 5432)',
        connectionUrl: directUrl.substring(0, 50) + '...',
        timestamp: new Date().toISOString(),
        note: 'Even direct connection is not working - check Supabase project status'
      });
    } finally {
      await directPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Direct Supabase test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Direct Supabase test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
