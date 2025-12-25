import { z } from "zod";
import { stringOrNumber } from "../schemas.mjs";
import { toolResult } from "../toolResult.mjs";
import { isWpError, wpErrorToolResult } from "../wpErrors.mjs";
import { buildQuery } from "../wpUtils.mjs";

// Registers meta/diagnostic tools like ping, post types, and plugins.
export function registerMetaTools(server, { wpFetch }) {
  server.tool("ping", "Ping test", async () => {
    return toolResult({ ok: true }, { text: "ok" });
  });

  server.tool(
    "list_post_types",
    "List WordPress post types",
    {
      context: z.string().optional(),
    },
    async ({ context } = {}) => {
      const query = buildQuery({ context });
      const types = await wpFetch(`/wp-json/wp/v2/types${query}`);

      if (isWpError(types)) {
        return wpErrorToolResult(types);
      }

      return toolResult({ types });
    }
  );

  server.tool(
    "list_plugins",
    "List WordPress plugins",
    {
      per_page: stringOrNumber.optional(),
      page: stringOrNumber.optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      context: z.string().optional(),
    },
    async ({ per_page = 100, page, search, status, context } = {}) => {
      const query = buildQuery({ per_page, page, search, status, context });
      const plugins = await wpFetch(`/wp-json/wp/v2/plugins${query}`);

      if (isWpError(plugins)) {
        return wpErrorToolResult(plugins);
      }

      return toolResult({ plugins });
    }
  );
}
