import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Supabase REST API');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Environment check:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseKey: supabaseKey ? 'Set' : 'Missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Test simple user lookup
    console.log('Testing user lookup...');
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=id,email,role&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User lookup failed:', errorText);
      return NextResponse.json(
        { error: 'User lookup failed', details: errorText },
        { status: 500 }
      );
    }

    const users = await userResponse.json();
    console.log('Users found:', users);

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase REST API is working!',
      users: users
    });

  } catch (error: any) {
    console.error('Supabase REST API Test Error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
