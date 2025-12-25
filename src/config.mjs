export function getEnvConfig() {
  const { WP_URL, WP_USER, WP_APP_PASS } = process.env;

  if (!WP_URL || !WP_USER || !WP_APP_PASS) {
    throw new Error("Missing required WP_* environment variables");
  }

  return {
    wpUrl: WP_URL,
    wpUser: WP_USER,
    wpAppPass: WP_APP_PASS,
  };
}
