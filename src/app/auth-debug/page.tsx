"use client";

import { useState } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress, Divider } from '@mui/material';

export default function AuthDebugPage() {
  const [loading, setLoading] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to check database connection and permissions
  const checkDatabase = async () => {
    setLoading(true);
    setError(null);
    setDbCheckResult(null);

    try {
      const response = await fetch('/api/check-db');
      const data = await response.json();
      setDbCheckResult(data);
      if (response.status >= 400) {
        setError(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Authentication Debug Page</Typography>
      <Typography variant="body1" paragraph>
        This page helps diagnose issues with the Supabase database connection and permissions.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Database Connection Check</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Click the button below to check your database connection, RLS policies, and test user plan creation.
        </Typography>

        <Button 
          variant="contained" 
          onClick={checkDatabase}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Check Database Connection'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {dbCheckResult && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Environment Variables:</Typography>
            <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
              {JSON.stringify(dbCheckResult.env, null, 2)}
            </pre>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1">Database Connection:</Typography>
            <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
              {JSON.stringify(dbCheckResult.dbConnection, null, 2)}
            </pre>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1">User Plan Table:</Typography>
            <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
              {JSON.stringify(dbCheckResult.userPlanTable, null, 2)}
            </pre>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1">RLS Policies:</Typography>
            <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
              {JSON.stringify(dbCheckResult.rlsPolicies, null, 2)}
            </pre>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1">Test Insert:</Typography>
            <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
              {JSON.stringify(dbCheckResult.testInsert, null, 2)}
            </pre>
            
            {dbCheckResult.testCleanup && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1">Test Cleanup:</Typography>
                <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto' }}>
                  {JSON.stringify(dbCheckResult.testCleanup, null, 2)}
                </pre>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
