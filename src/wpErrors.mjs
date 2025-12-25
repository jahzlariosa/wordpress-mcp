import { toolResult } from "./toolResult.mjs";

export function isWpError(result) {
  return result && typeof result === "object" && result.error;
}

export function wpErrorToolResult(result) {
  return toolResult(result, {
    text: `WP error ${result.status}: ${result.body}`,
  });
}

export function parseWpErrorCode(body) {
  if (!body) {
    return null;
  }
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" ? parsed.code : null;
  } catch {
    return null;
  }
}
