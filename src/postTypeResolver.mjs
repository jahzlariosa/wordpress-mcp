import { isParametrizedRestBase, normalizePostTypeInput } from "./wpUtils.mjs";

const DEFAULT_REST_BASES = new Map([
  ["post", "posts"],
  ["posts", "posts"],
  ["page", "pages"],
  ["pages", "pages"],
  ["attachment", "media"],
  ["media", "media"],
  ["nav_menu_item", "menu-items"],
  ["menu-items", "menu-items"],
  ["wp_block", "blocks"],
  ["blocks", "blocks"],
  ["wp_template", "templates"],
  ["templates", "templates"],
  ["wp_template_part", "template-parts"],
  ["template-parts", "template-parts"],
  ["wp_global_styles", "global-styles"],
  ["global-styles", "global-styles"],
  ["wp_navigation", "navigation"],
  ["navigation", "navigation"],
  ["wp_font_family", "font-families"],
  ["font-families", "font-families"],
]);

const DEFAULT_REST_BASE_SET = new Set(DEFAULT_REST_BASES.values());

export function createPostTypeResolver({ wpFetch, logger = console }) {
  let cache = null;
  let inFlight = null;

  async function loadTypes() {
    if (cache) {
      return cache;
    }
    if (inFlight) {
      return inFlight;
    }

    inFlight = (async () => {
      const types = await wpFetch("/wp-json/wp/v2/types");
      if (!types || (typeof types === "object" && types.error)) {
        if (types && types.error) {
          logger.error("MCP: Failed to load post types", {
            status: types.status,
            body: types.body,
          });
        }
        cache = {
          slugToRest: new Map(),
          restBases: new Set(DEFAULT_REST_BASE_SET),
        };
        return cache;
      }

      const slugToRest = new Map();
      const restBases = new Set(DEFAULT_REST_BASE_SET);

      if (types && typeof types === "object") {
        for (const [slug, type] of Object.entries(types)) {
          if (!type || typeof type !== "object") {
            continue;
          }
          const restBase = type.rest_base;
          if (typeof restBase !== "string" || !restBase) {
            continue;
          }
          restBases.add(restBase);
          if (!isParametrizedRestBase(restBase)) {
            slugToRest.set(slug, restBase);
          }
        }
      }

      cache = { slugToRest, restBases };
      return cache;
    })();

    return inFlight;
  }

  return async function resolvePostType(value) {
    const normalized = normalizePostTypeInput(value);
    if (!normalized) {
      return "posts";
    }

    const defaultRestBase = DEFAULT_REST_BASES.get(normalized);
    if (defaultRestBase) {
      return defaultRestBase;
    }

    const { slugToRest, restBases } = await loadTypes();
    if (slugToRest.has(normalized)) {
      return slugToRest.get(normalized);
    }
    if (restBases.has(normalized)) {
      return normalized;
    }

    return normalized;
  };
}
