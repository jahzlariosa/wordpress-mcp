import { z } from "zod";
import { stringOrNumber, stringOrStringArray } from "../schemas.mjs";
import { toolResult } from "../toolResult.mjs";
import { isWpError, wpErrorToolResult } from "../wpErrors.mjs";
import { buildQuery } from "../wpUtils.mjs";

// Registers user management tools.
export function registerUserTools(server, { wpFetch }) {
  server.tool(
    "list_users",
    "List WordPress users",
    {
      per_page: stringOrNumber.optional(),
      page: stringOrNumber.optional(),
      search: z.string().optional(),
      role: z.string().optional(),
      roles: stringOrStringArray.optional(),
    },
    async ({ per_page = 10, page, search, role, roles } = {}) => {
      const query = buildQuery({ per_page, page, search, role, roles });
      const users = await wpFetch(`/wp-json/wp/v2/users${query}`);

      if (isWpError(users)) {
        return wpErrorToolResult(users);
      }

      return toolResult({ users });
    }
  );

  server.tool(
    "get_user",
    "Get a WordPress user by ID",
    {
      id: stringOrNumber.optional(),
      context: z.string().optional(),
    },
    async ({ id = "me", context } = {}) => {
      const userId = id || "me";
      const query = buildQuery({ context });
      const user = await wpFetch(`/wp-json/wp/v2/users/${userId}${query}`);

      if (isWpError(user)) {
        return wpErrorToolResult(user);
      }

      return toolResult({ user });
    }
  );

  server.tool(
    "create_user",
    "Create a WordPress user",
    {
      username: z.string().optional(),
      email: z.string().optional(),
      password: z.string().optional(),
      roles: stringOrStringArray.optional(),
      name: z.string().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
    },
    async ({
      username,
      email,
      password,
      roles,
      name,
      first_name,
      last_name,
    } = {}) => {
      const user = await wpFetch("/wp-json/wp/v2/users", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          roles,
          name,
          first_name,
          last_name,
        }),
      });

      if (isWpError(user)) {
        return wpErrorToolResult(user);
      }

      return toolResult({ user });
    }
  );

  server.tool(
    "update_user",
    "Update a WordPress user",
    {
      id: stringOrNumber,
      email: z.string().optional(),
      password: z.string().optional(),
      roles: stringOrStringArray.optional(),
      name: z.string().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      username: z.string().optional(),
      slug: z.string().optional(),
    },
    async ({
      id,
      email,
      password,
      roles,
      name,
      first_name,
      last_name,
      username,
      slug,
    } = {}) => {
      const user = await wpFetch(`/wp-json/wp/v2/users/${id}`, {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          roles,
          name,
          first_name,
          last_name,
          username,
          slug,
        }),
      });

      if (isWpError(user)) {
        return wpErrorToolResult(user);
      }

      return toolResult({ user });
    }
  );

  server.tool(
    "delete_user",
    "Delete a WordPress user",
    {
      id: stringOrNumber,
      force: z.boolean().optional(),
      reassign: stringOrNumber.optional(),
    },
    async ({ id, force = true, reassign } = {}) => {
      const query = buildQuery({ force, reassign });
      const result = await wpFetch(`/wp-json/wp/v2/users/${id}${query}`, {
        method: "DELETE",
      });

      if (isWpError(result)) {
        return wpErrorToolResult(result);
      }

      return toolResult({ result });
    }
  );
}
