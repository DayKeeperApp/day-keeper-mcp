import { DayKeeperApiError } from "../shared/errors.js";
import type { HttpClient } from "./http.js";

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
  path?: string[];
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLClient {
  query<T>(document: string, variables?: Record<string, unknown>): Promise<T>;
  mutate<T>(document: string, variables?: Record<string, unknown>): Promise<T>;
}

export function createGraphQLClient(http: HttpClient): GraphQLClient {
  async function execute<T>(document: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await http.post<GraphQLResponse<T>>("/graphql", {
      query: document,
      variables: variables ?? {},
    });

    if (response.errors?.length) {
      const firstError = response.errors[0];
      const code = firstError.extensions?.code;
      const statusCode = mapGraphQLErrorToStatus(code);
      const message = response.errors.map((e) => e.message).join("; ");

      throw new DayKeeperApiError(message, statusCode, response.errors);
    }

    if (!response.data) {
      throw new DayKeeperApiError("GraphQL response contained no data", 500);
    }

    return response.data;
  }

  return {
    query: execute,
    mutate: execute,
  };
}

function mapGraphQLErrorToStatus(code: string | undefined): number {
  switch (code) {
    case "AUTH_NOT_AUTHENTICATED":
      return 401;
    case "AUTH_NOT_AUTHORIZED":
      return 403;
    case "ENTITY_NOT_FOUND":
      return 404;
    case "INPUT_VALIDATION":
      return 400;
    case "BUSINESS_RULE_VIOLATION":
      return 422;
    default:
      return 500;
  }
}
