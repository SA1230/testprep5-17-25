import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get the code from the URL
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    
    if (code) {
      // Create a Supabase client using the cookies
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
    }
    
    // Always redirect to the test-data page
    return NextResponse.redirect(new URL('/test-data', req.url));
  } catch (error) {
    console.error('Error in auth callback:', error);
    // Redirect with error
    return NextResponse.redirect(new URL('/test-data', req.url));
  }
}
