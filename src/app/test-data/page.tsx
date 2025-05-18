"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { browserClient } from '@/lib/supabase/browser-client';
import { Box, Typography, Paper, List, ListItem, Divider, Chip, CircularProgress, Button, Alert, AlertTitle } from '@mui/material';

export default function TestDataPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string>('Checking authentication...');
  const [userPlanStatus, setUserPlanStatus] = useState<string>('Checking user plan...');
  const [authError, setAuthError] = useState<string | null>(null);
  
  // State to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // First useEffect just to mark client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check for auth errors in URL - only runs on client
  useEffect(() => {
    if (!isClient) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const authErrorParam = urlParams.get('error');
    const authErrorDesc = urlParams.get('error_description');
    
    if (authErrorParam) {
      setAuthError(`Authentication error: ${authErrorParam}${authErrorDesc ? ` - ${authErrorDesc}` : ''}`);
      setAuthStatus(`Failed: ${authErrorParam}`);
    }
    
    // Check for hash error (from Supabase direct redirect)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const hashError = hashParams.get('error');
    const hashErrorDesc = hashParams.get('error_description');
    
    if (hashError) {
      setAuthError(`Authentication error: ${hashError}${hashErrorDesc ? ` - ${hashErrorDesc}` : ''}`);
      setAuthStatus(`Failed: ${hashError}`);
    }
  }, [isClient]);

  // Data fetching effect - only runs on client side
  useEffect(() => {
    // Don't run on server-side render
    if (!isClient) return;
    
    async function fetchData() {
      try {
        setLoading(true);
        
        // Check authentication status
        setAuthStatus('Fetching authentication session...');
        
        // Try the browser client first (for better session management)
        try {
          const { data: authData } = await browserClient.auth.getSession();
          setSession(authData.session);
          
          if (authData.session) {
            setAuthStatus(`Authenticated as ${authData.session.user.email}`);
          } else {
            // Fall back to the regular client if needed
            const { data: fallbackData } = await supabase.auth.getSession();
            setSession(fallbackData.session);
            
            if (fallbackData.session) {
              setAuthStatus(`Authenticated as ${fallbackData.session.user.email}`);
            } else {
              setAuthStatus('Not authenticated');
            }
          }
        } catch (err) {
          console.error('Error with browser client, falling back:', err);
          const { data: fallbackData } = await supabase.auth.getSession();
          setSession(fallbackData.session);
          
          if (fallbackData.session) {
            setAuthStatus(`Authenticated as ${fallbackData.session.user.email}`);
          } else {
            setAuthStatus('Not authenticated');
          }
        }
        
        // Fetch subjects
        const { data: subjectsData } = await supabase
          .from('subjects')
          .select('*');
          
        if (subjectsData) {
          setSubjects(subjectsData);
        }
        
        // Fetch questions
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*, subject:subjects(*)')
          .limit(10);
          
        if (questionsData) {
          setQuestions(questionsData);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setLoading(false);
        setError(`Error fetching data: ${err.message}`);
      }
    }
    
    fetchData();
  }, [isClient]);
  
  // Check user plan when session changes
  useEffect(() => {
    if (!isClient || !session?.user) return;
    
    async function checkUserPlan() {
      try {
        setUserPlanStatus('Checking user plan...');
        
        const { data: planData, error: planError } = await supabase
          .from('user_plan')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (planError && planError.code !== 'PGRST116') {
          console.error('Error checking user plan:', planError);
          setUserPlanStatus(`Error: ${planError.message}`);
          return;
        }
        
        if (planData) {
          setUserPlan(planData);
          setUserPlanStatus('User plan found');
        } else {
          setUserPlanStatus('No user plan found');
        }
      } catch (err: any) {
        console.error('Exception checking user plan:', err);
        setUserPlanStatus(`Error: ${err.message}`);
      }
    }
    
    checkUserPlan();
  }, [isClient, session]);
  
  // Function to manually create a user plan
  const createUserPlan = async () => {
    if (!session?.user?.id) {
      setError('You must be logged in to create a user plan');
      return;
    }
    
    try {
      setUserPlanStatus('Creating user plan...');
      setError(null);
      
      // Call the API endpoint to create a user plan
      const response = await fetch('/api/create-user-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setUserPlanStatus(`Error creating user plan: ${data.error || 'Unknown error'}`);
        setError(data.error || 'Unknown error');
        return;
      }
      
      setUserPlan(data.plan);
      setUserPlanStatus('User plan created successfully!');
    } catch (err: any) {
      console.error('Exception creating user plan:', err);
      setUserPlanStatus('Failed to create user plan');
      setError(`Exception creating user plan: ${err.message}`);
    }
  };
  
  // Handle sign in with Google
  const handleSignIn = async () => {
    try {
      setAuthStatus('Signing in with Google...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/test-data`
        }
      });
      
      if (error) {
        setAuthStatus(`Sign-in error: ${error.message}`);
        setAuthError(error.message);
      }
    } catch (err: any) {
      setAuthStatus(`Exception during sign-in: ${err.message}`);
      console.error('Sign-in exception:', err);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      setAuthStatus('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setAuthStatus(`Sign-out error: ${error.message}`);
        setAuthError(error.message);
      } else {
        setSession(null);
        setUserPlan(null);
        setAuthStatus('Signed out');
        setUserPlanStatus('Signed out');
      }
    } catch (err: any) {
      setAuthStatus(`Exception during sign-out: ${err.message}`);
      console.error('Sign-out exception:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Test Data</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Authentication Status</Typography>
        <Typography color="info.main" sx={{ mb: 2 }}>
          Status: {session ? `Authenticated as ${session.user.email}` : 'Not authenticated'}
        </Typography>
        
        {authError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {authError}
          </Alert>
        )}
        
        {session ? (
          <>
            <Typography color="success.main">✅ Authenticated</Typography>
            <Typography>User ID: {session.user.id}</Typography>
            <Typography>Email: {session.user.email}</Typography>
            <Typography>Provider: {session.user.app_metadata?.provider || 'email'}</Typography>
            <Typography>Created at: {new Date(session.user.created_at).toLocaleString()}</Typography>
            
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleSignOut}
              sx={{ mt: 2 }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Typography color="error">❌ Not authenticated</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSignIn}
              sx={{ mt: 2, mr: 2 }}
            >
              Sign In with Google (Direct)
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              href="/auth-ui"
              sx={{ mt: 2 }}
            >
              Sign In with Auth UI
            </Button>
          </>
        )}
      </Paper>

      {session && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>User Plan</Typography>
          <Typography color="info.main" sx={{ mb: 2 }}>
            Status: {userPlanStatus}
          </Typography>
          
          {session && !userPlan && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>User Plan Missing</AlertTitle>
              No user plan found for your account. This might be due to a database error.
              <Button 
                variant="contained" 
                color="primary" 
                onClick={createUserPlan} 
                sx={{ mt: 1, display: 'block' }}
              >
                Create User Plan Manually
              </Button>
            </Alert>
          )}
          
          {userPlan ? (
            <>
              <Typography color="success.main">✅ User plan found</Typography>
              <Typography>Tier: {userPlan.tier}</Typography>
              <Typography>Tutor tokens today: {userPlan.tutor_tokens_today}</Typography>
              <Typography>Reset date: {userPlan.reset_at}</Typography>
            </>
          ) : session ? (
            <>
              <Typography color="error.main">❌ No user plan found</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={createUserPlan} 
                sx={{ mt: 2 }}
              >
                Create User Plan Manually
              </Button>
            </>
          ) : (
            <Typography color="warning.main">⚠️ Sign in to view user plan</Typography>
          )}
        </Paper>
      )}
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Subjects ({subjects.length})</Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <List>
          {subjects.map((subject) => (
            <ListItem key={subject.id}>
              <Typography>{subject.name}</Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Typography variant="h5" gutterBottom>Questions ({questions.length})</Typography>
      {questions.map((question) => (
        <Paper key={question.id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={question.subject?.name || 'Unknown'} 
              color="primary" 
              size="small" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label={`Difficulty: ${question.difficulty}`} 
              color="secondary" 
              size="small" 
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>{question.stem}</Typography>
          
          {(typeof question.choices === 'string' ? JSON.parse(question.choices) : question.choices).map((choice: any, index: number) => (
            <Typography 
              key={choice.label} 
              sx={{ 
                mb: 1, 
                fontWeight: index === question.correct_choice ? 'bold' : 'normal',
                color: index === question.correct_choice ? 'success.main' : 'inherit'
              }}
            >
              {choice.label}. {choice.text}
            </Typography>
          ))}
          
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Explanation:</Typography>
          <Typography variant="body2">{question.explanation}</Typography>
        </Paper>
      ))}
    </Box>
  );
}
