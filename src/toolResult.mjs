function normalizeStructuredContent(data) {
  if (data === undefined || data === null) {
    return undefined;
  }
  if (Array.isArray(data)) {
    return { items: data };
  }
  if (typeof data === "object") {
    return data;
  }
  return { value: data };
}

export function toolResult(data, options = {}) {
  const structured = normalizeStructuredContent(data);
  let text = options.text;
  if (text === undefined) {
    if (structured !== undefined) {
      try {
        text = JSON.stringify(structured);
      } catch (error) {
        text = String(structured);
      }
    } else if (data !== undefined) {
      text = String(data);
    } else {
      text = "";
    }
  }

  const result = {
    content: [{ type: "text", text }],
  };

  if (structured !== undefined) {
    result.structuredContent = structured;
  }

  if (data && typeof data === "object" && data.error) {
    result.isError = true;
  }

  return result;
}
