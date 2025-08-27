import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing direct database connection (port 5432)...');
    
    // Create a temporary Prisma client with direct connection
    // This bypasses the connection pooler completely
    
    const { PrismaClient } = await import('@prisma/client');
    
    // Get the current DATABASE_URL and modify it for direct connection
    const currentUrl = process.env.DATABASE_URL;
    if (!currentUrl) {
      return NextResponse.json({
        success: false,
        message: 'DATABASE_URL not set',
        timestamp: new Date().toISOString()
      });
    }
    
    // Convert pooler URL to direct connection URL
    let directUrl = currentUrl;
    if (currentUrl.includes(':6543')) {
      // Replace pooler with direct connection
      directUrl = currentUrl
        .replace(':6543', ':5432')
        .replace('aws-1-eu-central-2.pooler.supabase.com', 'db.mokrzgcbweenzmxlkcoo.supabase.co')
        .replace('?pgbouncer=true', '?sslmode=require');
      
      console.log('🔄 Converted pooler URL to direct connection');
    }
    
    console.log('🔗 Testing direct connection URL:', directUrl.substring(0, 50) + '...');
    
    // Create a new Prisma client with the direct connection
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
      console.log('✅ Direct connection successful!');
      
      // Try a simple query
      const result = await directPrisma.$queryRaw`SELECT current_database(), current_user, version()`;
      console.log('✅ Database query successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Direct database connection working!',
        databaseInfo: result,
        connectionType: 'Direct (port 5432)',
        timestamp: new Date().toISOString(),
        note: 'Database is accessible via direct connection'
      });
      
    } catch (connectionError: any) {
      console.error('❌ Direct connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Direct connection failed',
        error: connectionError.message,
        connectionType: 'Direct (port 5432)',
        timestamp: new Date().toISOString(),
        note: 'Even direct connection is not working'
      });
    } finally {
      await directPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Direct DB test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Direct DB test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
