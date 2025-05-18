"use client";

import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { supabase } from '@/lib/supabase/client';
import { browserClient } from '@/lib/supabase/browser-client';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';

// GraphQL query to get subjects
const GET_SUBJECTS = gql`
  query GetSubjects {
    subjectsCollection {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

// GraphQL query to get questions
const GET_QUESTIONS = gql`
  query GetQuestions {
    questionsCollection(first: 5) {
      edges {
        node {
          id
          stem
          difficulty
          subject {
            id
            name
          }
        }
      }
    }
  }
`;

// GraphQL query to get user_plan
const GET_USER_PLAN = gql`
  query GetUserPlan($userId: UUID!) {
    user_planCollection(filter: { user_id: { eq: $userId } }) {
      edges {
        node {
          user_id
          tier
          tutor_tokens_today
          reset_at
        }
      }
    }
  }
`;

export default function TestGraphQLPage() {
  const [user, setUser] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string>('Checking authentication...');
  const [activeQuery, setActiveQuery] = useState<string>('');

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        setAuthStatus('Fetching authentication session...');
        const { data: authData } = await browserClient.auth.getSession();
        
        if (authData.session) {
          setAuthStatus(`Authenticated as ${authData.session.user.email}`);
          setUser(authData.session.user);
        } else {
          setAuthStatus('Not authenticated');
          setUser(null);
        }
      } catch (err: any) {
        setAuthStatus(`Error checking authentication: ${err.message}`);
        console.error('Auth check error:', err);
      }
    }
    
    checkAuth();
    
    // Set up auth state listener
    const { data: authListener } = browserClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setAuthStatus(`Signed in as ${session?.user.email}`);
        setUser(session?.user);
      } else if (event === 'SIGNED_OUT') {
        setAuthStatus('Signed out');
        setUser(null);
      } else {
        setAuthStatus(`Auth state changed: ${event}`);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle sign in
  const handleSignIn = async () => {
    setAuthStatus('Initiating Google OAuth sign-in...');
    try {
      const { data, error } = await browserClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      
      if (error) {
        setAuthStatus(`Error during sign-in: ${error.message}`);
        console.error('Sign-in error:', error);
      } else {
        setAuthStatus('Sign-in initiated, waiting for redirect...');
      }
    } catch (err: any) {
      setAuthStatus(`Exception during sign-in: ${err.message}`);
      console.error('Sign-in exception:', err);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setAuthStatus('Signing out...');
    try {
      const { error } = await browserClient.auth.signOut();
      if (error) {
        setAuthStatus(`Error during sign-out: ${error.message}`);
        console.error('Sign-out error:', error);
      } else {
        setAuthStatus('Signed out successfully');
      }
    } catch (err: any) {
      setAuthStatus(`Exception during sign-out: ${err.message}`);
      console.error('Sign-out exception:', err);
    }
  };

  // Subjects query
  const { 
    loading: subjectsLoading, 
    error: subjectsError, 
    data: subjectsData,
    refetch: refetchSubjects
  } = useQuery(GET_SUBJECTS, {
    skip: activeQuery !== 'subjects'
  });

  // Questions query
  const { 
    loading: questionsLoading, 
    error: questionsError, 
    data: questionsData,
    refetch: refetchQuestions
  } = useQuery(GET_QUESTIONS, {
    skip: activeQuery !== 'questions'
  });

  // User plan query
  const { 
    loading: userPlanLoading, 
    error: userPlanError, 
    data: userPlanData,
    refetch: refetchUserPlan
  } = useQuery(GET_USER_PLAN, {
    variables: { userId: user?.id },
    skip: !user || activeQuery !== 'userPlan'
  });

  // Execute a GraphQL query
  const executeQuery = (queryType: string) => {
    setActiveQuery(queryType);
    
    // Refetch the appropriate query
    if (queryType === 'subjects') {
      refetchSubjects();
    } else if (queryType === 'questions') {
      refetchQuestions();
    } else if (queryType === 'userPlan' && user) {
      refetchUserPlan();
    }
  };

  // Render query results
  const renderQueryResults = () => {
    if (!activeQuery) {
      return (
        <Alert severity="info">
          Select a query to execute
        </Alert>
      );
    }

    if (
      (activeQuery === 'subjects' && subjectsLoading) ||
      (activeQuery === 'questions' && questionsLoading) ||
      (activeQuery === 'userPlan' && userPlanLoading)
    ) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (
      (activeQuery === 'subjects' && subjectsError) ||
      (activeQuery === 'questions' && questionsError) ||
      (activeQuery === 'userPlan' && userPlanError)
    ) {
      const error = 
        activeQuery === 'subjects' ? subjectsError :
        activeQuery === 'questions' ? questionsError :
        userPlanError;

      return (
        <Alert severity="error">
          Error executing query: {error?.message}
        </Alert>
      );
    }

    // Render subjects results
    if (activeQuery === 'subjects' && subjectsData) {
      const subjects = subjectsData.subjectsCollection?.edges || [];
      
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Subjects ({subjects.length})</Typography>
          
          {subjects.length > 0 ? (
            <List>
              {subjects.map((edge: any) => (
                <ListItem key={edge.node.id}>
                  <ListItemText primary={edge.node.name} secondary={edge.node.id} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">No subjects found</Alert>
          )}
        </Box>
      );
    }

    // Render questions results
    if (activeQuery === 'questions' && questionsData) {
      const questions = questionsData.questionsCollection?.edges || [];
      
      return (
        <Box>
          <Typography variant="h6" gutterBottom>Questions ({questions.length})</Typography>
          
          {questions.length > 0 ? (
            <List>
              {questions.map((edge: any) => (
                <ListItem key={edge.node.id}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={edge.node.subject?.name || 'Unknown'} 
                        color="primary" 
                        size="small" 
                      />
                      <Chip 
                        label={`Difficulty: ${edge.node.difficulty}`} 
                        color="secondary" 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body1">{edge.node.stem}</Typography>
                    <Typography variant="caption" color="text.secondary">{edge.node.id}</Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">No questions found</Alert>
          )}
        </Box>
      );
    }

    // Render user plan results
    if (activeQuery === 'userPlan' && userPlanData) {
      const userPlans = userPlanData.user_planCollection?.edges || [];
      
      return (
        <Box>
          <Typography variant="h6" gutterBottom>User Plan</Typography>
          
          {userPlans.length > 0 ? (
            <List>
              {userPlans.map((edge: any) => (
                <ListItem key={edge.node.user_id}>
                  <Box>
                    <Typography><strong>User ID:</strong> {edge.node.user_id}</Typography>
                    <Typography><strong>Tier:</strong> {edge.node.tier}</Typography>
                    <Typography><strong>Tutor Tokens Today:</strong> {edge.node.tutor_tokens_today}</Typography>
                    <Typography><strong>Reset At:</strong> {new Date(edge.node.reset_at).toLocaleDateString()}</Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="warning">No user plan found</Alert>
          )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>GraphQL Test Page</Typography>
      
      {/* Authentication Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Authentication Status</Typography>
        <Typography color="info.main" sx={{ mb: 2 }}>
          Status: {authStatus}
        </Typography>
        
        {user ? (
          <>
            <Typography color="success.main">✅ Authenticated</Typography>
            <Typography>User ID: {user.id}</Typography>
            <Typography>Email: {user.email}</Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              onClick={handleSignOut}
              sx={{ mt: 2 }}
            >
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Typography color="error">❌ Not authenticated</Typography>
            <Typography>You must be authenticated to test GraphQL queries with authentication.</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSignIn}
              sx={{ mt: 2 }}
            >
              Sign In with Google
            </Button>
          </>
        )}
      </Paper>

      {/* GraphQL Queries */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>GraphQL Queries</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => executeQuery('subjects')}
            disabled={!user && activeQuery !== 'subjects'}
          >
            Get Subjects
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => executeQuery('questions')}
            disabled={!user && activeQuery !== 'questions'}
          >
            Get Questions
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => executeQuery('userPlan')}
            disabled={!user}
          >
            Get User Plan
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Query Results */}
        <Box sx={{ mt: 2 }}>
          {renderQueryResults()}
        </Box>
      </Paper>
    </Box>
  );
}
