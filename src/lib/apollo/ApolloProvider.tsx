"use client";

import { ApolloProvider as Provider } from '@apollo/client';
import { ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import apolloClient from './client';

interface ApolloProviderProps {
  children: ReactNode;
}

// Client-side only Apollo Provider to avoid hydration issues
function ClientApolloProvider({ children }: ApolloProviderProps) {
  return (
    <Provider client={apolloClient}>
      {children}
    </Provider>
  );
}

// This component handles the client-side only rendering of Apollo Provider
export function ApolloProvider({ children }: ApolloProviderProps) {
  // Use state to track if we're on the client
  const [isClient, setIsClient] = useState(false);

  // After mount, set isClient to true
  useEffect(() => {
    setIsClient(true);
  }, []);

  // On the server or during first render, just render children without Apollo
  // This ensures the HTML is the same on server and client for first render
  if (!isClient) {
    return <>{children}</>;
  }

  // On the client after hydration, wrap with Apollo Provider
  return (
    <ClientApolloProvider>
      {children}
    </ClientApolloProvider>
  );
}
