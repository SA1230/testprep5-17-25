"use client";

import { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Alert, CircularProgress } from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DirectAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Try direct email signup
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/test-data`,
        }
      });

      if (signUpError) {
        setError(`Sign-up error: ${signUpError.message}`);
      } else {
        setResult({
          message: 'Sign-up successful! Check your email for confirmation.',
          user: data.user
        });
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Try direct email sign-in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(`Sign-in error: ${signInError.message}`);
      } else {
        setResult({
          message: 'Sign-in successful!',
          user: data.user,
          session: data.session
        });
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Direct Authentication</Typography>
      <Typography variant="body1" paragraph>
        This page allows direct email/password authentication to test if the issue is specific to Google OAuth.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">{result.message}</Typography>
            <pre style={{ background: '#f5f5f5', padding: 10, overflow: 'auto', fontSize: '0.8rem' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Alert>
        )}
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button component={Link} href="/test-data" variant="outlined">
          Back to Test Data
        </Button>
        <Button component={Link} href="/auth-ui" variant="outlined" color="secondary">
          Auth UI
        </Button>
      </Box>
    </Box>
  );
}
