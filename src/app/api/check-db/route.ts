import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: NextRequest) {
  try {
    const results: any = {};
    
    // Check environment variables
    results.env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
    };
    
    // Test database connection
    try {
      const { data: healthData, error: healthError } = await supabaseAdmin.rpc('pg_health');
      results.dbConnection = healthError ? { error: healthError.message } : { success: true, data: healthData };
    } catch (err: any) {
      results.dbConnection = { error: err.message };
      
      // Try a simpler query if the health check fails
      try {
        const { data, error } = await supabaseAdmin.from('subjects').select('count').limit(1);
        results.simpleQuery = error ? { error: error.message } : { success: true };
      } catch (err: any) {
        results.simpleQuery = { error: err.message };
      }
    }
    
    // Check user_plan table structure
    try {
      const { data: tableInfo, error: tableError } = await supabaseAdmin
        .from('user_plan')
        .select('*')
        .limit(1);
      
      results.userPlanTable = tableError ? { error: tableError.message } : { success: true, exists: true };
    } catch (err: any) {
      results.userPlanTable = { error: err.message };
    }
    
    // Check RLS policies
    try {
      const { data: policies, error: policiesError } = await supabaseAdmin.rpc(
        'get_policies_for_table',
        { table_name: 'user_plan' }
      );
      
      results.rlsPolicies = policiesError ? { error: policiesError.message } : { success: true, policies };
    } catch (err: any) {
      // If the RPC function doesn't exist, try a direct query to pg_policies
      try {
        const { data: policies, error: policiesError } = await supabaseAdmin.from('pg_policies').select('*').eq('tablename', 'user_plan');
        results.rlsPolicies = policiesError ? { error: policiesError.message } : { success: true, policies };
      } catch (err2: any) {
        results.rlsPolicies = { error: err.message, fallbackError: err2.message };
      }
    }
    
    // Try to create a test user_plan
    try {
      // Generate a random UUID for testing
      const testUserId = crypto.randomUUID();
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('user_plan')
        .insert([
          { 
            user_id: testUserId, 
            tier: 'free', 
            tutor_tokens_today: 0,
            reset_at: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
          }
        ])
        .select();
      
      results.testInsert = insertError ? { error: insertError.message } : { success: true };
      
      // Clean up the test data
      if (!insertError) {
        const { error: deleteError } = await supabaseAdmin
          .from('user_plan')
          .delete()
          .eq('user_id', testUserId);
        
        results.testCleanup = deleteError ? { error: deleteError.message } : { success: true };
      }
    } catch (err: any) {
      results.testInsert = { error: err.message };
    }
    
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
