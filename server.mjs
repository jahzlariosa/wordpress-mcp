import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { getEnvConfig } from "./src/config.mjs";
import { createPostTypeResolver } from "./src/postTypeResolver.mjs";
import { createWpClient } from "./src/wpClient.mjs";
import { registerMetaTools } from "./src/tools/meta.mjs";
import { registerPageTools } from "./src/tools/pages.mjs";
import { registerPostTools } from "./src/tools/posts.mjs";
import { registerTaxonomyTools } from "./src/tools/taxonomies.mjs";
import { registerUserTools } from "./src/tools/users.mjs";

// Entry point: load config, create client/resolver, register tools, and connect.
console.error("MCP: process started");

let config;
try {
  config = getEnvConfig();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const wpClient = createWpClient(config);
const resolvePostType = createPostTypeResolver({ wpFetch: wpClient.wpFetch });

const server = new McpServer({
  name: "WordPressMCP",
  version: "0.1.0",
});

registerMetaTools(server, { wpFetch: wpClient.wpFetch });
registerPostTools(server, {
  wpFetch: wpClient.wpFetch,
  writePostLike: wpClient.writePostLike,
  updatePostLike: wpClient.updatePostLike,
  resolvePostType,
});
registerPageTools(server, {
  wpFetch: wpClient.wpFetch,
  writePostLike: wpClient.writePostLike,
  updatePostLike: wpClient.updatePostLike,
  resolvePostType,
});
registerTaxonomyTools(server, { wpFetch: wpClient.wpFetch });
registerUserTools(server, { wpFetch: wpClient.wpFetch });

console.error("MCP: tools registered");

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("MCP: connected");
