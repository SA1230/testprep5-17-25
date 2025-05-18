"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AuthUIPage() {
  const [isClient, setIsClient] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Only render Auth UI on the client to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    
    // Check for auth errors in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        setAuthError(`${error}${errorDescription ? `: ${errorDescription}` : ''}`);
      }
      
      // Check for hash error (from Supabase direct redirect)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      const hashError = hashParams.get('error');
      const hashErrorDesc = hashParams.get('error_description');
      
      if (hashError) {
        setAuthError(`${hashError}${hashErrorDesc ? `: ${hashErrorDesc}` : ''}`);
      }
    }
    
    // Check current auth status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthStatus(`Authenticated as ${data.session.user.email}`);
      } else {
        setAuthStatus('Not authenticated');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Sign In / Sign Up</Typography>
      
      {authError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Authentication error: {authError}
        </Alert>
      )}
      
      {authStatus && (
        <Alert severity={authStatus.startsWith('Not') ? 'info' : 'success'} sx={{ mb: 2 }}>
          {authStatus}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {isClient ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/test-data`}
            onlyThirdPartyProviders={true}
          />
        ) : (
          <Typography>Loading authentication...</Typography>
        )}
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button component={Link} href="/test-data" variant="outlined">
          Back to Test Data
        </Button>
        <Button component={Link} href="/supabase-test" variant="outlined" color="secondary">
          Connection Test
        </Button>
      </Box>
    </Box>
  );
}
