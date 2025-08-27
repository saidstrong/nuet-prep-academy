import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing Supabase connection pooler with CORRECT password...');
    
    // Try the connection pooler with the CORRECT password
    const { PrismaClient } = await import('@prisma/client');
    
    // CORRECT PASSWORD: Saltanat_1980_ (with underscore)
    const poolerUrl = "postgresql://postgres:Saltanat_1980_@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&pool_timeout=20";
    
    console.log('🔗 Testing pooler with CORRECT password:', poolerUrl.substring(0, 50) + '...');
    
    // Create a new Prisma client with pooler connection
    const poolerPrisma = new PrismaClient({
      datasources: {
        db: {
          url: poolerUrl,
        },
      },
      log: ['error'],
    });
    
    try {
      // Test connection
      await poolerPrisma.$connect();
      console.log('✅ Supabase pooler connection successful with CORRECT password!');
      
      // Try a simple query
      const result = await poolerPrisma.$queryRaw`SELECT current_database(), current_user, version()`;
      console.log('✅ Database query successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Supabase pooler connection working with CORRECT password!',
        databaseInfo: result,
        connectionType: 'Pooler (port 6543)',
        passwordUsed: 'Saltanat_1980_ (CORRECT)',
        timestamp: new Date().toISOString(),
        note: 'Pooler connection works - now we can create tables and seed data!'
      });
      
    } catch (connectionError: any) {
      console.error('❌ Supabase pooler connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Supabase pooler connection failed',
        error: connectionError.message,
        connectionType: 'Pooler (port 6543)',
        passwordUsed: 'Saltanat_1980_ (CORRECT)',
        timestamp: new Date().toISOString(),
        note: 'Pooler connection also failing - this is a network connectivity issue'
      });
    } finally {
      await poolerPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Pooler test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Pooler test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
