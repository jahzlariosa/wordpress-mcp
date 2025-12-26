// Reads required WordPress environment variables.
export function getEnvConfig() {
  const {
    WP_URL,
    WP_USER,
    WP_APP_PASS,
    IMAGE_GEN_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_BASE_URL,
    OPENAI_IMAGE_MODEL,
  } = process.env;

  if (!WP_URL || !WP_USER || !WP_APP_PASS) {
    throw new Error("Missing required WP_* environment variables");
  }

  return {
    wpUrl: WP_URL,
    wpUser: WP_USER,
    wpAppPass: WP_APP_PASS,
    imageProvider: IMAGE_GEN_PROVIDER,
    openaiApiKey: OPENAI_API_KEY,
    openaiBaseUrl: OPENAI_BASE_URL,
    openaiImageModel: OPENAI_IMAGE_MODEL,
  };
}
