import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: NextRequest) {
  try {
    // Get a test user ID - this should be a real user ID from your auth.users table
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        error: 'Missing userId parameter',
        message: 'Please provide a userId query parameter'
      }, { status: 400 });
    }
    
    // Log detailed information about the operation
    console.log('Testing user plan creation with admin client');
    console.log('User ID:', userId);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // First, check if the user exists in auth.users
    // We need to use the auth.admin API instead of querying the table directly
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
    if (userError) {
      console.error('Error checking if user exists:', userError);
      return NextResponse.json({
        error: 'Error checking if user exists',
        details: userError
      }, { status: 500 });
    }
    
    if (!userData || !userData.user) {
      return NextResponse.json({
        error: 'User not found',
        message: 'The provided user ID does not exist in auth.users'
      }, { status: 404 });
    }
    
    console.log('User found:', userData.user);
    
    // Check if user_plan already exists
    const { data: existingPlan, error: planCheckError } = await supabaseAdmin
      .from('user_plan')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (existingPlan) {
      console.log('User plan already exists:', existingPlan);
      return NextResponse.json({
        message: 'User plan already exists',
        plan: existingPlan
      });
    }
    
    if (planCheckError && planCheckError.code !== 'PGRST116') {
      console.error('Error checking for existing user plan:', planCheckError);
      return NextResponse.json({
        error: 'Error checking for existing user plan',
        details: planCheckError
      }, { status: 500 });
    }
    
    // Try to create a user plan with admin privileges
    console.log('Attempting to create user plan with admin client');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('user_plan')
      .insert([
        { 
          user_id: userId, 
          tier: 'free', 
          tutor_tokens_today: 0,
          reset_at: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
        }
      ])
      .select();
      
    if (insertError) {
      console.error('Error creating user plan with admin client:', insertError);
      return NextResponse.json({
        error: 'Failed to create user plan',
        details: insertError
      }, { status: 500 });
    }
    
    console.log('User plan created successfully:', insertData);
    return NextResponse.json({
      message: 'User plan created successfully',
      plan: insertData[0]
    });
    
  } catch (err: any) {
    console.error('Unexpected error in test-user-plan endpoint:', err);
    return NextResponse.json({
      error: 'Unexpected error',
      message: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
