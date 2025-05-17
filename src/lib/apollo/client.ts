import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Observable } from '@apollo/client/utilities';
import { supabase, isUsingMockData } from '../supabase/client';

// Create a mock link that returns predefined data
const mockLink = new ApolloLink((operation) => {
  const { operationName } = operation;
  console.log(`Mock GraphQL operation: ${operationName}`);
  
  // Use Observable to properly implement the ApolloLink interface
  return new Observable((observer: any) => {
    setTimeout(() => {
      observer.next({
        data: {
          // Default empty response - would be filled with mock data in a real implementation
        }
      });
      observer.complete();
    }, 100); // Simulate network delay
    
    // Return cleanup function
    return () => {};
  });
});

// Create an HTTP link for the real Supabase GraphQL endpoint
const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
});

// Add authentication headers to requests
const authLink = setContext(async (_, { headers }) => {
  // Get the current session
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
      apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  };
});

// Create the Apollo Client with the appropriate link based on mode
const apolloClient = new ApolloClient({
  link: isUsingMockData ? mockLink : authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

console.log(`Apollo client initialized in ${isUsingMockData ? 'MOCK' : 'REAL'} mode`);

export default apolloClient;
