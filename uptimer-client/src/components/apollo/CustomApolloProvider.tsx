"use client";

import { ApolloProvider } from "@apollo/client";
import { useEffect, useState } from "react";
import { apolloClient, initPersistorCache } from "../../queries/apolloClient";

export default function CustomApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      await initPersistorCache();
      setInitialized(true);
    })();
  }, []);

  if (!initialized) return null; // Optionally render a loader here

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
