import { ApolloClient, InMemoryCache } from '@apollo/client';

// Create a simple Apollo Client that works without a real GraphQL endpoint
const apolloClient = new ApolloClient({
  uri: 'http://localhost:3000/api/graphql', // This is a dummy URL, we're not actually using it
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default apolloClient;
