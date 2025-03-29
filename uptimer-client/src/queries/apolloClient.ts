import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { CachePersistor, LocalStorageWrapper } from 'apollo3-cache-persist';
import { DocumentNode, Kind, OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';

const httpUrl: string = 'http://localhost:5000/graphql';
const wsUrl: string = 'ws://localhost:5000/graphql';

const httpLink: ApolloLink = createHttpLink({
  uri: httpUrl,
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsUrl,
    retryAttempts: 20,
    shouldRetry: () => true,
    on: {
      closed: () => {
        console.log('Client closed');
      },
      connected: () => {
        console.log('Client connected');
      },
    },
  })
);

const cache: InMemoryCache = new InMemoryCache();

let apolloPersistor: CachePersistor<NormalizedCacheObject> | null = null;

export async function initPersistorCache(): Promise<void> {
  apolloPersistor = new CachePersistor({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    debug: false,
    trigger: 'write',
  });

  await apolloPersistor.restore();
}

function isSubscription({ query }: { query: DocumentNode }): boolean {
  const definition = getMainDefinition(query);
  return (
    definition.kind === Kind.OPERATION_DEFINITION &&
    definition.operation === OperationTypeNode.SUBSCRIPTION
  );
}

const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache,
  connectToDevTools: true,
});

export { apolloClient, apolloPersistor };
