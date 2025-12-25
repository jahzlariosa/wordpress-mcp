import { z } from "zod";
import { stringOrNumber, stringOrRaw } from "../schemas.mjs";
import { toolResult } from "../toolResult.mjs";
import { isWpError, wpErrorToolResult } from "../wpErrors.mjs";
import { buildQuery, parseStatusOverride } from "../wpUtils.mjs";

// Registers post/CPT tools with dynamic post type routing.
export function registerPostTools(
  server,
  { wpFetch, writePostLike, updatePostLike, resolvePostType }
) {
  server.tool(
    "list_posts",
    "List WordPress posts",
    {
      per_page: stringOrNumber.optional(),
      page: stringOrNumber.optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      type: z.string().optional(),
      post_type: z.string().optional(),
    },
    async ({ per_page = 10, page, search, status, type, post_type } = {}) => {
      const postType = await resolvePostType(post_type || type);
      const query = buildQuery({ per_page, page, search, status });
      const posts = await wpFetch(`/wp-json/wp/v2/${postType}${query}`);

      if (isWpError(posts)) {
        return wpErrorToolResult(posts);
      }

      return toolResult({ posts });
    }
  );

  server.tool(
    "get_post",
    "Get a WordPress post by ID",
    {
      id: stringOrNumber,
      type: z.string().optional(),
      post_type: z.string().optional(),
    },
    async ({ id, type, post_type } = {}) => {
      const postType = await resolvePostType(post_type || type);
      const post = await wpFetch(`/wp-json/wp/v2/${postType}/${id}`);

      if (isWpError(post)) {
        return wpErrorToolResult(post);
      }

      return toolResult({ post });
    }
  );

  server.tool(
    "create_post",
    "Create a WordPress post (draft by default)",
    {
      title: stringOrRaw.optional(),
      content: stringOrRaw.optional(),
      status: z.string().optional(),
      excerpt: stringOrRaw.optional(),
      slug: z.string().optional(),
      type: z.string().optional(),
      post_type: z.string().optional(),
    },
    async ({
      title,
      content,
      status,
      excerpt,
      slug,
      type,
      post_type,
    } = {}) => {
      console.error("MCP: create_post called with:", {
        title,
        content,
        status,
        excerpt,
        slug,
        type,
        post_type,
      });

      const parsedStatus = parseStatusOverride(status);
      const postType = await resolvePostType(
        post_type || type || parsedStatus.postType
      );
      const resolvedStatus = parsedStatus.status ?? "draft";

      const post = await writePostLike(`/wp-json/wp/v2/${postType}`, {
        title,
        content,
        status: resolvedStatus,
        excerpt,
        slug,
      });

      if (isWpError(post)) {
        return wpErrorToolResult(post);
      }

      return toolResult({ post });
    }
  );

  server.tool(
    "create_announcement",
    "Create a WordPress announcement (draft by default)",
    {
      title: stringOrRaw.optional(),
      content: stringOrRaw.optional(),
      status: z.string().optional(),
      excerpt: stringOrRaw.optional(),
      slug: z.string().optional(),
      type: z.string().optional(),
      post_type: z.string().optional(),
    },
    async ({
      title,
      content,
      status = "draft",
      excerpt,
      slug,
      type,
      post_type,
    } = {}) => {
      console.error("MCP: create_announcement called with:", {
        title,
        content,
        status,
        excerpt,
        slug,
        type,
        post_type,
      });

      const postType = await resolvePostType(post_type || type || "announcement");
      const announcement = await writePostLike(`/wp-json/wp/v2/${postType}`, {
        title,
        content,
        status,
        excerpt,
        slug,
      });

      if (isWpError(announcement)) {
        return wpErrorToolResult(announcement);
      }

      return toolResult({ announcement });
    }
  );

  server.tool(
    "update_post",
    "Update a WordPress post",
    {
      id: stringOrNumber,
      title: stringOrRaw.optional(),
      content: stringOrRaw.optional(),
      status: z.string().optional(),
      excerpt: stringOrRaw.optional(),
      slug: z.string().optional(),
      type: z.string().optional(),
      post_type: z.string().optional(),
    },
    async ({
      id,
      title,
      content,
      status,
      excerpt,
      slug,
      type,
      post_type,
    } = {}) => {
      console.error("MCP: update_post called with:", {
        id,
        title,
        content,
        status,
        excerpt,
        slug,
        type,
        post_type,
      });

      const parsedStatus = parseStatusOverride(status);
      const postType = await resolvePostType(
        post_type || type || parsedStatus.postType
      );

      const post = await updatePostLike(`/wp-json/wp/v2/${postType}/${id}`, {
        title,
        content,
        status: parsedStatus.status,
        excerpt,
        slug,
      });

      if (isWpError(post)) {
        return wpErrorToolResult(post);
      }

      return toolResult({ post });
    }
  );

  server.tool(
    "delete_post",
    "Delete a WordPress post",
    {
      id: stringOrNumber,
      force: z.boolean().optional(),
      type: z.string().optional(),
      post_type: z.string().optional(),
    },
    async ({ id, force = false, type, post_type } = {}) => {
      const postType = await resolvePostType(post_type || type);
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
