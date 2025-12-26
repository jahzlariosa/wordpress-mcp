// Shared helpers for WordPress REST params and payloads.
export function normalizeFormValue(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (Object.hasOwn(value, "raw")) {
      return value.raw;
    }
  }
  return value;
}

export function buildFormBody(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        const normalized = normalizeFormValue(item);
        if (normalized === undefined || normalized === null) {
          continue;
        }
        searchParams.append(key, String(normalized));
      }
    } else {
      const normalized = normalizeFormValue(value);
      if (normalized === undefined || normalized === null) {
        continue;
      }
      searchParams.set(key, String(normalized));
    }
  }

  return searchParams.toString();
}

// Build query strings from optional params; skip null/undefined.
export function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) {
          continue;
        }
        searchParams.append(key, String(item));
      }
    } else {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function normalizeWpTextField(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (Object.hasOwn(value, "raw")) {
      return { raw: String(value.raw) };
    }
  }
  return String(value);
}

export function buildYoastMeta(yoast = {}) {
  if (!yoast || typeof yoast !== "object") {
    return undefined;
  }

  const meta = {};
  const setIfDefined = (key, value) => {
    if (value !== undefined) {
      meta[key] = value;
    }
  };

  setIfDefined("_yoast_wpseo_title", yoast.title);
  setIfDefined("_yoast_wpseo_metadesc", yoast.description);
  setIfDefined("_yoast_wpseo_focuskw", yoast.focuskw);
  setIfDefined("_yoast_wpseo_focuskw_synonyms", yoast.focuskw_synonyms);
  setIfDefined("_yoast_wpseo_focuskeywords", yoast.focuskeywords);
  setIfDefined("_yoast_wpseo_keywordsynonyms", yoast.keywordsynonyms);
  setIfDefined("_yoast_wpseo_canonical", yoast.canonical);
  setIfDefined("_yoast_wpseo_opengraph-title", yoast.og_title);
  setIfDefined("_yoast_wpseo_opengraph-description", yoast.og_description);
  setIfDefined("_yoast_wpseo_twitter-title", yoast.twitter_title);
  setIfDefined("_yoast_wpseo_twitter-description", yoast.twitter_description);

  if (yoast.noindex !== undefined) {
    meta["_yoast_wpseo_meta-robots-noindex"] = yoast.noindex ? 1 : 0;
  }
  if (yoast.nofollow !== undefined) {
    meta["_yoast_wpseo_meta-robots-nofollow"] = yoast.nofollow ? 1 : 0;
  }

  return Object.keys(meta).length ? meta : undefined;
}

// Accepts slugs, REST bases, or full URLs and normalizes to a base token.
export function normalizePostTypeInput(value) {
  if (value === undefined || value === null) {
    return "";
  }
  let slug = String(value).trim();
  if (!slug) {
    return "";
  }

  slug = slug.replace(/^https?:\/\/[^/]+/i, "");
  slug = slug.split("?")[0];
  slug = slug.split("#")[0];
  slug = slug.replace(/^\/+/, "");
  slug = slug.replace(/^wp-json\/wp\/v2\//i, "");

  return slug;
}

// Allows "type:status" to select a CPT without a separate type field.
export function parseStatusOverride(status) {
  if (typeof status !== "string") {
    return { status, postType: undefined };
  }
  const separatorIndex = status.indexOf(":");
  if (separatorIndex === -1) {
    return { status, postType: undefined };
  }
  const maybeType = normalizePostTypeInput(status.slice(0, separatorIndex));
  const maybeStatus = status.slice(separatorIndex + 1).trim();
  if (!maybeType || !maybeStatus) {
    return { status, postType: undefined };
  }
  return {
    status: maybeStatus,
    postType: maybeType,
  };
}

export function isParametrizedRestBase(value) {
  if (!value) {
    return false;
  }
  return /[\(\)\[\]\?\<\>]/.test(value);
}
