import { isWpError, parseWpErrorCode } from "./wpErrors.mjs";
import { buildFormBody, normalizeWpTextField } from "./wpUtils.mjs";

// WordPress REST client with auth, logging, and empty_content retry handling.
export function createWpClient({ wpUrl, wpUser, wpAppPass }, logger = console) {
  const authHeader =
    "Basic " + Buffer.from(`${wpUser}:${wpAppPass}`, "utf8").toString("base64");

  async function wpFetch(path, options = {}) {
    const url = `${wpUrl}${path}`;

    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "WordPressMCP/1.0",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();

    if (!res.ok) {
      logger.error("WP API ERROR", {
        url,
        status: res.status,
        body: text,
      });

      return {
        error: true,
        status: res.status,
        body: text,
      };
    }

    return text ? JSON.parse(text) : null;
  }

  function normalizePostPayload(payload) {
    const cleanPayload = {};

    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined && value !== null) {
        if (key === "title" || key === "content" || key === "excerpt") {
          cleanPayload[key] = normalizeWpTextField(value);
        } else {
          cleanPayload[key] = value;
        }
      }
    }

    return cleanPayload;
  }

  async function writePostLike(path, payload) {
    const cleanPayload = normalizePostPayload(payload);

    logger.error("MCP: Sending payload:", JSON.stringify(cleanPayload));

    let result = await wpFetch(path, {
      method: "POST",
      body: JSON.stringify(cleanPayload),
    });

    logger.error("MCP: Response:", JSON.stringify(result).substring(0, 200));

    // Retry with form-encoded payload if WP rejects JSON with empty_content.
    if (
      isWpError(result) &&
      result.status === 400 &&
      parseWpErrorCode(result.body) === "empty_content"
    ) {
      logger.error("MCP: Retrying with form-encoded payload");
      const formPayload = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          formPayload[key] = value;
        }
      }
      const formBody = buildFormBody(formPayload);
      logger.error("MCP: Form body:", formBody);
      result = await wpFetch(path, {
        method: "POST",
        body: formBody,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    }

    return result;
  }

  async function updatePostLike(path, payload) {
    const cleanPayload = normalizePostPayload(payload);

    logger.error("MCP: Updating with payload:", JSON.stringify(cleanPayload));

    const result = await wpFetch(path, {
      method: "POST",
      body: JSON.stringify(cleanPayload),
    });

    logger.error("MCP: Update response:", JSON.stringify(result).substring(0, 200));

    return result;
  }

  return {
    wpFetch,
    writePostLike,
    updatePostLike,
  };
}
