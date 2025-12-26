function normalizeBaseUrl(value, fallback) {
  const base = value && String(value).trim();
  if (!base) {
    return fallback;
  }
  return base.replace(/\/+$/, "");
}

// Image generation client for configured providers (currently OpenAI).
export function createImageClient(config = {}, logger = console) {
  const providerInput = config.imageProvider
    ? String(config.imageProvider).trim().toLowerCase()
    : "";
  const openaiApiKey = config.openaiApiKey;
  const provider = providerInput || (openaiApiKey ? "openai" : "");
  const openaiBaseUrl = normalizeBaseUrl(
    config.openaiBaseUrl,
    "https://api.openai.com/v1"
  );
  const openaiImageModel = config.openaiImageModel || "gpt-image-1";

  async function generateImageOpenAI({
    prompt,
    size,
    quality,
    style,
    n,
    response_format,
    model,
  }) {
    if (!openaiApiKey) {
      return {
        error: true,
        status: 400,
        body: "Missing OPENAI_API_KEY for image generation.",
      };
    }

    const resolvedModel = model || openaiImageModel;
    const normalizedModel = String(resolvedModel).trim().toLowerCase();
    const supportsResponseFormat = normalizedModel.startsWith("dall-e-");

    const payload = {
      model: resolvedModel,
      prompt,
    };

    if (size !== undefined) {
      payload.size = size;
    }
    if (quality !== undefined) {
      payload.quality = quality;
    }
    if (style !== undefined) {
      payload.style = style;
    }
    if (n !== undefined) {
      const count = Number(n);
      if (Number.isFinite(count)) {
        payload.n = count;
      }
    }
    if (response_format !== undefined && supportsResponseFormat) {
      payload.response_format = response_format;
    }

    let res;
    try {
      res = await fetch(`${openaiBaseUrl}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      return {
        error: true,
        status: 502,
        body: `Image provider request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }

    const text = await res.text();
    if (!res.ok) {
      logger.error("Image provider error", {
        provider: "openai",
        status: res.status,
        body: text,
      });
      return { error: true, status: res.status, body: text };
    }

    if (!text) {
      return { provider: "openai", response: null };
    }

    try {
      return { provider: "openai", response: JSON.parse(text) };
    } catch (error) {
      return {
        error: true,
        status: 502,
        body: `Invalid JSON response from image provider: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async function generateImage(args) {
    if (!provider) {
      return {
        error: true,
        status: 400,
        body:
          "Image generation not configured. Set IMAGE_GEN_PROVIDER and provider credentials.",
      };
    }
    if (provider === "openai") {
      return generateImageOpenAI(args);
    }
    return {
      error: true,
      status: 400,
      body: `Unsupported image provider: ${provider}`,
    };
  }

  return {
    provider,
    generateImage,
  };
}
