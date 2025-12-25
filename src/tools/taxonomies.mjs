import { z } from "zod";
import { stringOrNumber, stringOrNumberArray } from "../schemas.mjs";
import { toolResult } from "../toolResult.mjs";
import { isWpError, wpErrorToolResult } from "../wpErrors.mjs";
import { buildQuery } from "../wpUtils.mjs";

// Registers category and tag taxonomy tools.
export function registerTaxonomyTools(server, { wpFetch }) {
  server.tool(
    "list_categories",
    "List WordPress categories",
    {
      per_page: stringOrNumber.optional(),
      page: stringOrNumber.optional(),
      search: z.string().optional(),
      hide_empty: z.boolean().optional(),
      parent: stringOrNumber.optional(),
      post: stringOrNumber.optional(),
      slug: z.string().optional(),
      include: stringOrNumberArray.optional(),
      exclude: stringOrNumberArray.optional(),
      order: z.string().optional(),
      orderby: z.string().optional(),
      context: z.string().optional(),
    },
    async ({
      per_page = 10,
      page,
      search,
      hide_empty,
      parent,
      post,
      slug,
      include,
      exclude,
      order,
      orderby,
      context,
    } = {}) => {
      const query = buildQuery({
        per_page,
        page,
        search,
        hide_empty,
        parent,
        post,
        slug,
        include,
        exclude,
        order,
        orderby,
        context,
      });
      const categories = await wpFetch(`/wp-json/wp/v2/categories${query}`);

      if (isWpError(categories)) {
        return wpErrorToolResult(categories);
      }

      return toolResult({ categories });
    }
  );

  server.tool(
    "get_category",
    "Get a WordPress category by ID",
    {
      id: stringOrNumber,
      context: z.string().optional(),
    },
    async ({ id, context } = {}) => {
      const query = buildQuery({ context });
      const category = await wpFetch(`/wp-json/wp/v2/categories/${id}${query}`);

      if (isWpError(category)) {
        return wpErrorToolResult(category);
      }

      return toolResult({ category });
    }
  );

  server.tool(
    "create_category",
    "Create a WordPress category",
    {
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      parent: stringOrNumber.optional(),
    },
    async ({ name, slug, description, parent } = {}) => {
      const category = await wpFetch("/wp-json/wp/v2/categories", {
        method: "POST",
        body: JSON.stringify({
          name,
          slug,
          description,
          parent,
        }),
      });

      if (isWpError(category)) {
        return wpErrorToolResult(category);
      }

      return toolResult({ category });
    }
  );

  server.tool(
    "update_category",
    "Update a WordPress category",
    {
      id: stringOrNumber,
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      parent: stringOrNumber.optional(),
    },
    async ({ id, name, slug, description, parent } = {}) => {
      const category = await wpFetch(`/wp-json/wp/v2/categories/${id}`, {
        method: "POST",
        body: JSON.stringify({
          name,
          slug,
          description,
          parent,
        }),
      });

      if (isWpError(category)) {
        return wpErrorToolResult(category);
      }

      return toolResult({ category });
    }
  );

  server.tool(
    "delete_category",
    "Delete a WordPress category",
    {
      id: stringOrNumber,
      force: z.boolean().optional(),
    },
    async ({ id, force = true } = {}) => {
      const query = buildQuery({ force });
      const result = await wpFetch(
        `/wp-json/wp/v2/categories/${id}${query}`,
        {
          method: "DELETE",
        }
      );

      if (isWpError(result)) {
        return wpErrorToolResult(result);
      }

      return toolResult({ result });
    }
  );

  server.tool(
    "list_tags",
    "List WordPress tags",
    {
      per_page: stringOrNumber.optional(),
      page: stringOrNumber.optional(),
      search: z.string().optional(),
      hide_empty: z.boolean().optional(),
      post: stringOrNumber.optional(),
      slug: z.string().optional(),
      include: stringOrNumberArray.optional(),
      exclude: stringOrNumberArray.optional(),
      order: z.string().optional(),
      orderby: z.string().optional(),
      context: z.string().optional(),
    },
    async ({
      per_page = 10,
      page,
      search,
      hide_empty,
      post,
      slug,
      include,
      exclude,
      order,
      orderby,
      context,
    } = {}) => {
      const query = buildQuery({
        per_page,
        page,
        search,
        hide_empty,
        post,
        slug,
        include,
        exclude,
        order,
        orderby,
        context,
      });
      const tags = await wpFetch(`/wp-json/wp/v2/tags${query}`);

      if (isWpError(tags)) {
        return wpErrorToolResult(tags);
      }

      return toolResult({ tags });
    }
  );

  server.tool(
    "get_tag",
    "Get a WordPress tag by ID",
    {
      id: stringOrNumber,
      context: z.string().optional(),
    },
    async ({ id, context } = {}) => {
      const query = buildQuery({ context });
      const tag = await wpFetch(`/wp-json/wp/v2/tags/${id}${query}`);

      if (isWpError(tag)) {
        return wpErrorToolResult(tag);
      }

      return toolResult({ tag });
    }
  );

  server.tool(
    "create_tag",
    "Create a WordPress tag",
    {
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
    },
    async ({ name, slug, description } = {}) => {
      const tag = await wpFetch("/wp-json/wp/v2/tags", {
        method: "POST",
        body: JSON.stringify({
          name,
          slug,
          description,
        }),
      });

      if (isWpError(tag)) {
        return wpErrorToolResult(tag);
      }

      return toolResult({ tag });
    }
  );

  server.tool(
    "update_tag",
    "Update a WordPress tag",
    {
      id: stringOrNumber,
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
    },
    async ({ id, name, slug, description } = {}) => {
      const tag = await wpFetch(`/wp-json/wp/v2/tags/${id}`, {
        method: "POST",
        body: JSON.stringify({
          name,
          slug,
          description,
        }),
      });

      if (isWpError(tag)) {
        return wpErrorToolResult(tag);
      }

      return toolResult({ tag });
    }
  );

  server.tool(
    "delete_tag",
    "Delete a WordPress tag",
    {
      id: stringOrNumber,
      force: z.boolean().optional(),
    },
    async ({ id, force = true } = {}) => {
      const query = buildQuery({ force });
      const result = await wpFetch(`/wp-json/wp/v2/tags/${id}${query}`, {
        method: "DELETE",
      });

      if (isWpError(result)) {
        return wpErrorToolResult(result);
      }

      return toolResult({ result });
    }
  );
}
