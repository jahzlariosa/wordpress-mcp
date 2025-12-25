import { z } from "zod";
import { stringOrNumber, stringOrRaw } from "../schemas.mjs";
import { toolResult } from "../toolResult.mjs";
import { isWpError, wpErrorToolResult } from "../wpErrors.mjs";
import { buildQuery } from "../wpUtils.mjs";

// Registers page-specific tools.
export function registerPageTools(
  server,
  { wpFetch, writePostLike, updatePostLike, resolvePostType }
) {
  server.tool(
    "list_pages",
    "List WordPress pages",
    {
      per_page: stringOrNumber.optional(),
      page: stringOrNumber.optional(),
      search: z.string().optional(),
      status: z.string().optional(),
    },
    async ({ per_page = 10, page, search, status } = {}) => {
      const postType = await resolvePostType("page");
      const query = buildQuery({ per_page, page, search, status });
      const pages = await wpFetch(`/wp-json/wp/v2/${postType}${query}`);

      if (isWpError(pages)) {
        return wpErrorToolResult(pages);
      }

      return toolResult({ pages });
    }
  );

  server.tool(
    "get_page",
    "Get a WordPress page by ID",
    {
      id: stringOrNumber,
    },
    async ({ id } = {}) => {
      const postType = await resolvePostType("page");
      const page = await wpFetch(`/wp-json/wp/v2/${postType}/${id}`);

      if (isWpError(page)) {
        return wpErrorToolResult(page);
      }

      return toolResult({ page });
    }
  );

  server.tool(
    "create_page",
    "Create a WordPress page (draft by default)",
    {
      title: stringOrRaw.optional(),
      content: stringOrRaw.optional(),
      status: z.string().optional(),
      excerpt: stringOrRaw.optional(),
      slug: z.string().optional(),
      parent: stringOrNumber.optional(),
    },
    async ({
      title,
      content,
      status = "draft",
      excerpt,
      slug,
      parent,
    } = {}) => {
      console.error("MCP: create_page called with:", {
        title,
        content,
        status,
        excerpt,
        slug,
        parent,
      });

      const postType = await resolvePostType("page");
      const page = await writePostLike(`/wp-json/wp/v2/${postType}`, {
        title,
        content,
        status,
        excerpt,
        slug,
        parent,
      });

      if (isWpError(page)) {
        return wpErrorToolResult(page);
      }

      return toolResult({ page });
    }
  );

  server.tool(
    "update_page",
    "Update a WordPress page",
    {
      id: stringOrNumber,
      title: stringOrRaw.optional(),
      content: stringOrRaw.optional(),
      status: z.string().optional(),
      excerpt: stringOrRaw.optional(),
      slug: z.string().optional(),
      parent: stringOrNumber.optional(),
    },
    async ({
      id,
      title,
      content,
      status,
      excerpt,
      slug,
      parent,
    } = {}) => {
      console.error("MCP: update_page called with:", {
        id,
        title,
        content,
        status,
        excerpt,
        slug,
        parent,
      });

      const postType = await resolvePostType("page");
      const page = await updatePostLike(`/wp-json/wp/v2/${postType}/${id}`, {
        title,
        content,
        status,
        excerpt,
        slug,
        parent,
      });

      if (isWpError(page)) {
        return wpErrorToolResult(page);
      }

      return toolResult({ page });
    }
  );

  server.tool(
    "delete_page",
    "Delete a WordPress page",
    {
      id: stringOrNumber,
      force: z.boolean().optional(),
    },
    async ({ id, force = false } = {}) => {
      const postType = await resolvePostType("page");
      const query = buildQuery({ force });
      const result = await wpFetch(`/wp-json/wp/v2/${postType}/${id}${query}`, {
        method: "DELETE",
      });

      if (isWpError(result)) {
        return wpErrorToolResult(result);
      }

      return toolResult({ result });
    }
  );
}
