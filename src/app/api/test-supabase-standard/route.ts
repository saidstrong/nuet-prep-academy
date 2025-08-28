import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing standard Supabase connection format...');
    
    // Try the standard Supabase connection format
    // This should work with the newly created user
    const { PrismaClient } = await import('@prisma/client');
    
    // Standard Supabase connection format
    const standardUrl = "postgresql://postgres.mokrzgcbweenzmxlkcoo:Saltanat_1980_@db.mokrzgcbweenzmxlkcoo.supabase.co:5432/postgres?sslmode=require";
    
    console.log('🔗 Testing standard connection:', standardUrl.substring(0, 50) + '...');
    
    // Create a new Prisma client with standard connection
    const standardPrisma = new PrismaClient({
      datasources: {
        db: {
          url: standardUrl,
        },
      },
      log: ['error'],
    });
    
    try {
      // Test connection
      await standardPrisma.$connect();
      console.log('✅ Standard Supabase connection successful!');
      
      // Try a simple query
      const result = await standardPrisma.$queryRaw`SELECT current_database(), current_user, version()`;
      console.log('✅ Database query successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Standard Supabase connection working!',
        databaseInfo: result,
        connectionType: 'Standard (port 5432)',
        user: 'postgres.mokrzgcbweenzmxlkcoo',
        timestamp: new Date().toISOString(),
        note: 'Standard connection works - now we can create tables and seed data!'
      });
      
    } catch (connectionError: any) {
      console.error('❌ Standard Supabase connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Standard Supabase connection failed',
        error: connectionError.message,
        connectionType: 'Standard (port 5432)',
        user: 'postgres.mokrzgcbweenzmxlkcoo',
        timestamp: new Date().toISOString(),
        note: 'Standard connection failed - might need different connection format'
      });
    } finally {
      await standardPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Standard connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Standard connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
