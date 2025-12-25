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
