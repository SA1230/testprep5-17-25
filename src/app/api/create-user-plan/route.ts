import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    // Verify the user is authenticated
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - You must be logged in to create a user plan' },
        { status: 401 }
      );
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    console.log('Creating user plan for user:', userId);
    
    // Check if user plan already exists
    const { data: existingPlan, error: checkError } = await supabaseAdmin
      .from('user_plan')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingPlan) {
      return NextResponse.json(
        { message: 'User plan already exists', plan: existingPlan },
        { status: 200 }
      );
    }
    
    // Use our new SQL function for better error handling and diagnostics
    const { data: functionResult, error: functionError } = await supabaseAdmin.rpc(
      'create_user_plan_manually',
      { p_user_id: userId }
    );
    
    if (functionError) {
      console.error('Error calling create_user_plan_manually function:', functionError);
      return NextResponse.json(
        { error: `Failed to create user plan: ${functionError.message}` },
        { status: 500 }
      );
    }
    
    // Check the function result
    if (!functionResult.success) {
      console.error('Function reported error:', functionResult.error);
      return NextResponse.json(
        { 
          error: `Database function error: ${functionResult.message}`,
          details: functionResult
        },
        { status: 500 }
      );
    }
    
    // Extract the plan from the function result
    const plan = functionResult.plan;
    
    return NextResponse.json(
      { message: 'User plan created successfully', plan: plan },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Unexpected error creating user plan:', err);
    return NextResponse.json(
      { error: `Unexpected error: ${err.message}` },
      { status: 500 }
    );
  }
}
