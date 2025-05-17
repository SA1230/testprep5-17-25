"use client";

import { ApolloProvider as Provider } from '@apollo/client';
import { ReactNode, useState, useEffect } from 'react';
import { supabase, isUsingMockData } from '../supabase/client';
import apolloClient from './client';

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip auth check if using mock data
    if (isUsingMockData) {
      setIsLoading(false);
      return;
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      setIsLoading(false);
    };

    checkAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Handle sign in
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isUsingMockData && (
        <div style={{
          backgroundColor: '#f44336',
          color: 'white',
          textAlign: 'center',
          padding: '8px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          fontSize: '14px'
        }}>
          Running in development mode with mock data. Set up Supabase environment variables for production use.
        </div>
      )}
      
      {!isUsingMockData && !isAuthenticated && (
        <div style={{
          backgroundColor: '#2196F3',
          color: 'white',
          textAlign: 'center',
          padding: '8px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>You are not logged in. Some features may be limited.</span>
          <button 
            onClick={handleSignIn}
            style={{
              backgroundColor: 'white',
              color: '#2196F3',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sign In
          </button>
        </div>
      )}
      
      <Provider client={apolloClient}>
        <div style={{ marginTop: isUsingMockData || !isAuthenticated ? '40px' : '0' }}>
          {children}
        </div>
      </Provider>
    </>
  );
}
