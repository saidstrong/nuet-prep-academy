import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing Supabase connection with FIXED password...');
    
    // Create a direct connection to Supabase with the CORRECT password
    const { PrismaClient } = await import('@prisma/client');
    
    // CORRECT PASSWORD: Saltanat_1980_ (with underscore)
    const directUrl = "postgresql://postgres:Saltanat_1980_@db.mokrzgcbweenzmxlkcoo.supabase.co:5432/postgres?sslmode=require";
    
    console.log('🔗 Testing with CORRECT password:', directUrl.substring(0, 50) + '...');
    
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
      console.log('✅ Supabase connection successful with CORRECT password!');
      
      // Try a simple query
      const result = await directPrisma.$queryRaw`SELECT current_database(), current_user, version()`;
      console.log('✅ Database query successful:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Supabase connection working with CORRECT password!',
        databaseInfo: result,
        connectionType: 'Direct (port 5432)',
        passwordUsed: 'Saltanat_1980_ (CORRECT)',
        timestamp: new Date().toISOString(),
        note: 'Database is accessible - now we can create tables and seed data!'
      });
      
    } catch (connectionError: any) {
      console.error('❌ Supabase connection failed:', connectionError);
      
      return NextResponse.json({
        success: false,
        message: 'Supabase connection failed',
        error: connectionError.message,
        connectionType: 'Direct (port 5432)',
        passwordUsed: 'Saltanat_1980_ (CORRECT)',
        timestamp: new Date().toISOString(),
        note: 'Check if Supabase project is running and accessible'
      });
    } finally {
      await directPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Fixed password test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Fixed password test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
