import { describe, expect, test } from "bun:test";
import { createGraphQLClient } from "../../src/client/graphql.js";
import { DayKeeperApiError } from "../../src/shared/errors.js";
import { createMockHttpClient } from "../helpers/mock-client.js";

describe("GraphQLClient", () => {
  test("returns data from successful query", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      data: { calendars: { nodes: [{ id: "123", name: "Work" }] } },
    });

    const client = createGraphQLClient(http);
    const result = await client.query<{ calendars: { nodes: { id: string; name: string }[] } }>(
      "query { calendars { nodes { id name } } }",
    );

    expect(result.calendars.nodes).toHaveLength(1);
    expect(result.calendars.nodes[0].name).toBe("Work");
    expect(http.post).toHaveBeenCalledWith("/graphql", {
      query: "query { calendars { nodes { id name } } }",
      variables: {},
    });
  });

  test("passes variables to the query", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      data: { calendarEventById: { id: "abc", title: "Meeting" } },
    });

    const client = createGraphQLClient(http);
    await client.query("query ($id: UUID!) { calendarEventById(id: $id) { id title } }", {
      id: "abc",
    });

    expect(http.post).toHaveBeenCalledWith("/graphql", {
      query: "query ($id: UUID!) { calendarEventById(id: $id) { id title } }",
      variables: { id: "abc" },
    });
  });

  test("throws DayKeeperApiError on GraphQL errors", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      errors: [
        {
          message: "Entity not found",
          extensions: { code: "ENTITY_NOT_FOUND" },
          path: ["calendarEventById"],
        },
      ],
    });

    const client = createGraphQLClient(http);
    try {
      await client.query('query { calendarEventById(id: "missing") { id } }');
      throw new Error("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DayKeeperApiError);
      const apiError = error as DayKeeperApiError;
      expect(apiError.statusCode).toBe(404);
      expect(apiError.message).toBe("Entity not found");
    }
  });

  test("maps INPUT_VALIDATION error to 400", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      errors: [
        {
          message: "Title is required",
          extensions: { code: "INPUT_VALIDATION" },
        },
      ],
    });

    const client = createGraphQLClient(http);
    try {
      await client.mutate("mutation { createTask(input: {}) { id } }");
      throw new Error("Should have thrown");
    } catch (error) {
      const apiError = error as DayKeeperApiError;
      expect(apiError.statusCode).toBe(400);
      expect(apiError.message).toBe("Title is required");
    }
  });

  test("maps AUTH_NOT_AUTHENTICATED to 401", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      errors: [{ message: "Not authenticated", extensions: { code: "AUTH_NOT_AUTHENTICATED" } }],
    });

    const client = createGraphQLClient(http);
    try {
      await client.query("query { me { id } }");
      throw new Error("Should have thrown");
    } catch (error) {
      expect((error as DayKeeperApiError).statusCode).toBe(401);
    }
  });

  test("maps AUTH_NOT_AUTHORIZED to 403", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      errors: [{ message: "Not authorized", extensions: { code: "AUTH_NOT_AUTHORIZED" } }],
    });

    const client = createGraphQLClient(http);
    try {
      await client.query("query { adminData { id } }");
      throw new Error("Should have thrown");
    } catch (error) {
      expect((error as DayKeeperApiError).statusCode).toBe(403);
    }
  });

  test("maps BUSINESS_RULE_VIOLATION to 422", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      errors: [
        {
          message: "Cannot delete default calendar",
          extensions: { code: "BUSINESS_RULE_VIOLATION" },
        },
      ],
    });

    const client = createGraphQLClient(http);
    try {
      await client.mutate('mutation { deleteCalendar(id: "default") { id } }');
      throw new Error("Should have thrown");
    } catch (error) {
      expect((error as DayKeeperApiError).statusCode).toBe(422);
    }
  });

  test("maps unknown error code to 500", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      errors: [{ message: "Something went wrong", extensions: { code: "UNKNOWN_CODE" } }],
    });

    const client = createGraphQLClient(http);
    try {
      await client.query("query { data }");
      throw new Error("Should have thrown");
    } catch (error) {
      expect((error as DayKeeperApiError).statusCode).toBe(500);
    }
  });

  test("joins multiple error messages", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({
      errors: [
        { message: "Error one", extensions: {} },
        { message: "Error two", extensions: {} },
      ],
    });

    const client = createGraphQLClient(http);
    try {
      await client.query("query { data }");
      throw new Error("Should have thrown");
    } catch (error) {
      expect((error as DayKeeperApiError).message).toBe("Error one; Error two");
    }
  });

  test("throws on null data with no errors", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({ data: null });

    const client = createGraphQLClient(http);
    try {
      await client.query("query { data }");
      throw new Error("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DayKeeperApiError);
      expect((error as DayKeeperApiError).statusCode).toBe(500);
      expect((error as DayKeeperApiError).message).toContain("no data");
    }
  });

  test("throws on undefined data with no errors", async () => {
    const http = createMockHttpClient();
    http.post.mockResolvedValueOnce({});

    const client = createGraphQLClient(http);
    try {
      await client.query("query { data }");
      throw new Error("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DayKeeperApiError);
      expect((error as DayKeeperApiError).message).toContain("no data");
    }
  });
});
