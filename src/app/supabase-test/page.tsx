"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { supabase } from '@/lib/supabase/client';

export default function SupabaseTestPage() {
  const [isClient, setIsClient] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');
  const [error, setError] = useState<string | null>(null);
  const [envVars, setEnvVars] = useState<{[key: string]: string}>({});

  // Only run on client side
  useEffect(() => {
    setIsClient(true);
    
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setEnvVars({
      supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
      supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Not set'
    });
    
    // Test Supabase connection
    async function testConnection() {
      try {
        // Simple query to test connection
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .limit(1);
        
        if (error) {
          setConnectionStatus('Failed');
          setError(`Error connecting to Supabase: ${error.message}`);
        } else {
          setConnectionStatus('Connected');
        }
      } catch (err: any) {
        setConnectionStatus('Failed');
        setError(`Exception: ${err.message}`);
      }
    }
    
    testConnection();
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Supabase Connection Test</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Environment Variables</Typography>
        <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Connection Status</Typography>
        <Alert severity={connectionStatus === 'Connected' ? 'success' : 'error'}>
          {connectionStatus}
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
