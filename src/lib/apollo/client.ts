import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Observable } from '@apollo/client/utilities';
import { supabase, isUsingMockData } from '../supabase/client';

// Determine if we're running on the client
const isClient = typeof window !== 'undefined';

// Create a client-side only Apollo client to avoid hydration issues
let apolloClient: ApolloClient<any> | null = null;

// This function creates the Apollo client
function createApolloClient() {
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
  return new ApolloClient({
    link: isUsingMockData ? mockLink : authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
    ssrMode: !isClient, // Set SSR mode based on environment
  });
}

// Get the Apollo Client instance, creating it if necessary
function getApolloClient() {
  // For SSR, always create a new client
  if (!isClient) return createApolloClient();
  
  // For client-side, reuse the client instance
  if (!apolloClient) {
    apolloClient = createApolloClient();
    console.log(`Apollo client initialized in ${isUsingMockData ? 'MOCK' : 'REAL'} mode`);
  }
  
  return apolloClient;
}

export default getApolloClient();
