import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { getEnvConfig } from "./src/config.mjs";
import { createPostTypeResolver } from "./src/postTypeResolver.mjs";
import { createWpClient } from "./src/wpClient.mjs";
import { createImageClient } from "./src/imageClient.mjs";
import { registerMetaTools } from "./src/tools/meta.mjs";
import { registerMediaTools } from "./src/tools/media.mjs";
import { registerPageTools } from "./src/tools/pages.mjs";
import { registerPostTools } from "./src/tools/posts.mjs";
import { registerTaxonomyTools } from "./src/tools/taxonomies.mjs";
import { registerUserTools } from "./src/tools/users.mjs";

function isZodSchema(value) {
  return Boolean(value && typeof value.safeParse === "function");
}

function validateZodSchema(toolName, key, schema) {
  if (!schema || typeof schema.toJSONSchema !== "function") {
    return;
  }
  try {
    schema.toJSONSchema();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Tool "${toolName}" input "${key}" schema is invalid: ${message}`
    );
  }
}

function validateToolSchema(toolName, schema) {
  if (!schema) {
    return;
  }
  if (isZodSchema(schema)) {
    validateZodSchema(toolName, "input", schema);
    return;
  }
  if (typeof schema !== "object") {
    return;
  }

  const entries = Object.entries(schema);
  const hasZodEntries = entries.some(([, value]) => isZodSchema(value));
  if (!hasZodEntries) {
    return;
  }

  for (const [key, value] of entries) {
    if (!isZodSchema(value)) {
      throw new Error(`Tool "${toolName}" input "${key}" is not a Zod schema.`);
    }
    validateZodSchema(toolName, key, value);
  }
}

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
const imageClient = createImageClient(config);
const resolvePostType = createPostTypeResolver({ wpFetch: wpClient.wpFetch });

const server = new McpServer({
  name: "WordPressMCP",
  version: "0.1.0",
});

const originalTool = server.tool.bind(server);
server.tool = (name, description, schemaOrHandler, maybeHandler) => {
  if (typeof schemaOrHandler === "function") {
    return originalTool(name, description, schemaOrHandler);
  }
  validateToolSchema(name, schemaOrHandler);
  return originalTool(name, description, schemaOrHandler, maybeHandler);
};

registerMetaTools(server, { wpFetch: wpClient.wpFetch });
registerMediaTools(server, {
  wpFetch: wpClient.wpFetch,
  updatePostLike: wpClient.updatePostLike,
  imageClient,
});
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
