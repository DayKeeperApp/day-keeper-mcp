import type { GraphQLClient } from "../client/graphql.js";

export interface Connection<T> {
  nodes: T[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount?: number;
}

export interface PaginationOptions {
  first?: number;
  after?: string | null;
}

export async function fetchPage<T>(
  client: GraphQLClient,
  document: string,
  variables: Record<string, unknown>,
  connectionPath: string,
  options?: PaginationOptions,
): Promise<Connection<T>> {
  const vars = {
    ...variables,
    first: options?.first ?? 25,
    after: options?.after ?? null,
  };
  const data = await client.query<Record<string, Connection<T>>>(document, vars);
  return data[connectionPath];
}

export async function fetchAllPages<T>(
  client: GraphQLClient,
  document: string,
  variables: Record<string, unknown>,
  connectionPath: string,
  pageSize = 100,
): Promise<T[]> {
  const allNodes: T[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const page: Connection<T> = await fetchPage<T>(client, document, variables, connectionPath, {
      first: pageSize,
      after: cursor,
    });
    allNodes.push(...page.nodes);
    hasNextPage = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor;
  }

  return allNodes;
}
