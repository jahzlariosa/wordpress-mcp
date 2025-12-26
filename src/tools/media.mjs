import { z } from "zod";
import { stringOrNumber, stringOrRaw } from "../schemas.mjs";
import { toolResult } from "../toolResult.mjs";
import { isWpError, wpErrorToolResult } from "../wpErrors.mjs";
import { buildQuery, normalizeWpTextField } from "../wpUtils.mjs";

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    return null;
  }
  return { mimeType: match[1], data: match[2] };
}

function decodeBase64Payload({ data_base64, data_url, mime_type }) {
  const rawInput = data_url || data_base64;
  if (!rawInput) {
    return { error: "Provide data_base64 or data_url for the media payload." };
  }

  if (rawInput.startsWith("data:")) {
    const parsed = parseDataUrl(rawInput);
    if (!parsed) {
      return { error: "Invalid data_url format. Expected data:<mime>;base64,..." };
    }
    const buffer = Buffer.from(parsed.data.replace(/\s+/g, ""), "base64");
    return {
      buffer,
      mimeType: mime_type || parsed.mimeType,
    };
  }

  const buffer = Buffer.from(rawInput.replace(/\s+/g, ""), "base64");
  return {
    buffer,
    mimeType: mime_type || "application/octet-stream",
  };
}

function sanitizeFileName(fileName) {
  return String(fileName).replace(/["\r\n]/g, "_");
}

function parseContentDispositionFileName(value) {
  if (!value) {
    return null;
  }
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (utfMatch && utfMatch[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const nameMatch = /filename="?([^\";]+)"?/i.exec(value);
  return nameMatch && nameMatch[1] ? nameMatch[1] : null;
}

function extractFileNameFromUrl(sourceUrl) {
  if (!sourceUrl) {
    return null;
  }
  try {
    const url = new URL(sourceUrl);
    const baseName = url.pathname.split("/").pop();
    return baseName || null;
  } catch {
    return null;
  }
}

function resolveFileName({ file_name, source_url, content_disposition }) {
  if (file_name) {
    return sanitizeFileName(file_name);
  }
  const fromDisposition = parseContentDispositionFileName(content_disposition);
  if (fromDisposition) {
    return sanitizeFileName(fromDisposition);
  }
  const fromUrl = extractFileNameFromUrl(source_url);
  if (fromUrl) {
    return sanitizeFileName(fromUrl);
  }
  return "upload";
}

function normalizeMediaTextField(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  return normalizeWpTextField(value);
}

async function fetchSourcePayload({ source_url, source_headers }) {
  let response;
  try {
    response = await fetch(source_url, {
      headers: source_headers,
    });
  } catch (error) {
    return {
      error: `Failed to fetch source_url: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }

  const contentType = response.headers.get("content-type") || undefined;
  const contentDisposition =
    response.headers.get("content-disposition") || undefined;
  const buffer = Buffer.from(await response.arrayBuffer());

  if (!response.ok) {
    const errorBody = buffer.toString("utf8").slice(0, 200);
    return {
      error: `Source URL responded ${response.status}: ${errorBody}`,
    };
  }

  return {
    buffer,
    mimeType: contentType,
    contentDisposition,
  };
}

// Registers media tools like uploads and attachment lookup.
export function registerMediaTools(
  server,
  { wpFetch, updatePostLike, imageClient }
) {
  server.tool(
    "list_media",
    "List WordPress media items",
    {
      per_page: stringOrNumber.optional(),
      page: stringOrNumber.optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      media_type: z.string().optional(),
      mime_type: z.string().optional(),
    },
    async ({ per_page = 10, page, search, status, media_type, mime_type } = {}) => {
      const query = buildQuery({
        per_page,
        page,
        search,
        status,
        media_type,
        mime_type,
      });
      const media = await wpFetch(`/wp-json/wp/v2/media${query}`);

      if (isWpError(media)) {
        return wpErrorToolResult(media);
      }

      return toolResult({ media });
    }
  );

  server.tool(
    "get_media",
    "Get a WordPress media item by ID",
    {
      id: stringOrNumber,
    },
    async ({ id } = {}) => {
      const media = await wpFetch(`/wp-json/wp/v2/media/${id}`);

      if (isWpError(media)) {
        return wpErrorToolResult(media);
      }

      return toolResult({ media });
    }
  );

  server.tool(
    "upload_media",
    "Upload a WordPress media item",
    {
      file_name: z.string().optional(),
      data_base64: z.string().optional(),
      data_url: z.string().optional(),
      source_url: z.string().optional(),
      source_headers: z.record(z.string(), z.string()).optional(),
      mime_type: z.string().optional(),
      title: stringOrRaw.optional(),
      alt_text: z.string().optional(),
      caption: stringOrRaw.optional(),
      description: stringOrRaw.optional(),
      status: z.string().optional(),
      post: stringOrNumber.optional(),
    },
    async ({
      file_name,
      data_base64,
      data_url,
      source_url,
      source_headers,
      mime_type,
      title,
      alt_text,
      caption,
      description,
      status,
      post,
    } = {}) => {
      console.error("MCP: upload_media called with:", {
        file_name,
        has_data_base64: Boolean(data_base64),
        has_data_url: Boolean(data_url),
        has_source_url: Boolean(source_url),
        mime_type,
        title,
        alt_text,
        caption,
        description,
        status,
        post,
      });

      if (!source_url && !data_base64 && !data_url) {
        return toolResult({
          error: true,
          status: 400,
          body: "Provide source_url, data_base64, or data_url for upload_media.",
        });
      }
      if (!source_url && !file_name) {
        return toolResult({
          error: true,
          status: 400,
          body: "file_name is required when uploading base64 or data URLs.",
        });
      }

      let payload;
      if (source_url) {
        payload = await fetchSourcePayload({ source_url, source_headers });
        if (payload.error) {
          return toolResult({ error: true, status: 400, body: payload.error });
        }
      } else {
        payload = decodeBase64Payload({ data_base64, data_url, mime_type });
        if (payload.error) {
          return toolResult({ error: true, status: 400, body: payload.error });
        }
      }

      const safeFileName = resolveFileName({
        file_name,
        source_url,
        content_disposition: payload.contentDisposition,
      });
      const resolvedMimeType =
        mime_type || payload.mimeType || "application/octet-stream";
      const upload = await wpFetch(`/wp-json/wp/v2/media`, {
        method: "POST",
        body: payload.buffer,
        headers: {
          "Content-Type": resolvedMimeType,
          "Content-Disposition": `attachment; filename="${safeFileName}"`,
        },
      });

      if (isWpError(upload)) {
        return wpErrorToolResult(upload);
      }

      const shouldUpdate =
        title !== undefined ||
        alt_text !== undefined ||
        caption !== undefined ||
        description !== undefined ||
        status !== undefined ||
        post !== undefined;

      if (shouldUpdate && upload && typeof upload === "object" && upload.id) {
        const updated = await updatePostLike(
          `/wp-json/wp/v2/media/${upload.id}`,
          {
            title,
            alt_text,
            caption: normalizeMediaTextField(caption),
            description: normalizeMediaTextField(description),
            status,
            post,
          }
        );

        if (isWpError(updated)) {
          return wpErrorToolResult(updated);
        }

        return toolResult({ media: updated });
      }

      return toolResult({ media: upload });
    }
  );

  server.tool(
    "generate_image",
    "Generate an image using a configured AI provider",
    {
      prompt: z.string(),
      model: z.string().optional(),
      size: z.string().optional(),
      quality: z.string().optional(),
      style: z.string().optional(),
      n: stringOrNumber.optional(),
      response_format: z.string().optional(),
    },
    async ({
      prompt,
      model,
      size,
      quality,
      style,
      n,
      response_format,
    } = {}) => {
      if (!imageClient || typeof imageClient.generateImage !== "function") {
        return toolResult({
          error: true,
          status: 400,
          body: "Image generation is not configured for this server.",
        });
      }

      const result = await imageClient.generateImage({
        prompt,
        model,
        size,
        quality,
        style,
        n,
        response_format,
      });

      if (result && result.error) {
        return toolResult(result, {
          text: `Image generation error ${result.status}: ${result.body}`,
        });
      }

      return toolResult({
        provider: result.provider,
        response: result.response,
      });
    }
  );
}
