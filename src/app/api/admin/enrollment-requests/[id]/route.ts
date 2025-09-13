import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📝 Update Enrollment Request API called');

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not found. Please make sure you are signed in.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status, paymentStatus } = await request.json();
    
    console.log('Request data:', { id, status, paymentStatus });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Find user by email
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${session.user.email}&select=id,email,role`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('User lookup failed');
    }

    const users = await userResponse.json();
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found. Please make sure you are signed in.' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('User found:', user);

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can update enrollment requests' },
        { status: 403 }
      );
    }

    // Update enrollment request
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    console.log('Updating enrollment request:', updateData);

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/course_enrollments?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Enrollment update failed:', errorText);
      throw new Error(`Enrollment update failed: ${updateResponse.status} - ${errorText}`);
    }

    const updatedEnrollment = await updateResponse.json();
    console.log('Enrollment request updated successfully:', updatedEnrollment);

    return NextResponse.json({ 
      success: true, 
      message: 'Enrollment request updated successfully!',
      enrollment: updatedEnrollment[0]
    });

  } catch (error: any) {
    console.error('Update Enrollment Request API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update enrollment request', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}