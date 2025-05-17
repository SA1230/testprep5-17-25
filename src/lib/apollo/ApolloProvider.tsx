"use client";

import { ApolloProvider as Provider } from '@apollo/client';
import { ReactNode } from 'react';
import apolloClient from './client';

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <>
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
      <Provider client={apolloClient}>
        <div style={{ marginTop: '40px' }}>
          {children}
        </div>
      </Provider>
    </>
  );
}
