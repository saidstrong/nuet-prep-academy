import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔌 Testing Supabase REST API connectivity...');
    
    // Try to reach Supabase using the REST API instead of direct database
    // This bypasses database connection issues
    
    const supabaseUrl = "https://mokrzgcbweenzmxlkcoo.supabase.co";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET';
    
    console.log('🔗 Testing REST API:', supabaseUrl);
    console.log('🔑 Anon key available:', !!anonKey);
    
    try {
      // Try to make a simple HTTP request to Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Supabase REST API accessible!');
        
        return NextResponse.json({
          success: true,
          message: 'Supabase REST API is accessible!',
          connectionType: 'REST API',
          supabaseUrl,
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString(),
          note: 'REST API works - database connectivity issue is separate'
        });
        
      } else {
        console.log('⚠️ Supabase REST API responded with status:', response.status);
        
        return NextResponse.json({
          success: false,
          message: 'Supabase REST API responded with error',
          connectionType: 'REST API',
          supabaseUrl,
          responseStatus: response.status,
          responseText: await response.text(),
          timestamp: new Date().toISOString(),
          note: 'REST API responded but with error status'
        });
      }
      
    } catch (fetchError: any) {
      console.error('❌ Supabase REST API request failed:', fetchError);
      
      return NextResponse.json({
        success: false,
        message: 'Supabase REST API request failed',
        error: fetchError.message,
        connectionType: 'REST API',
        supabaseUrl,
        timestamp: new Date().toISOString(),
        note: 'Cannot reach Supabase REST API - this confirms network connectivity issue'
      });
    }
    
  } catch (error) {
    console.error('❌ REST API test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'REST API test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
