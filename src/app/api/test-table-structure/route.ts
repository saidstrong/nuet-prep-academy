import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Table Structure');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Test table existence and structure
    const tables = ['users', 'courses', 'course_enrollments'];
    const results: any = {};

    for (const table of tables) {
      try {
        console.log(`Testing table: ${table}`);
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?limit=1`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`${table} response status:`, response.status);
        
        if (response.ok) {
          const data = await response.json();
          results[table] = {
            exists: true,
            status: response.status,
            sampleData: data[0] || null,
            count: data.length
          };
        } else {
          const errorText = await response.text();
          results[table] = {
            exists: false,
            status: response.status,
            error: errorText
          };
        }
      } catch (error: any) {
        results[table] = {
          exists: false,
          error: error.message
        };
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Table structure test completed',
      results
    });

  } catch (error: any) {
    console.error('Table Structure Test Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
