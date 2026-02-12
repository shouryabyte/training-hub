function safeJsonFromText(text) {
  if (typeof text !== "string") return {};
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to extract JSON object from fenced or mixed output.
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first >= 0 && last > first) {
      const slice = trimmed.slice(first, last + 1);
      try {
        return JSON.parse(slice);
      } catch {
        return {};
      }
    }
    return {};
  }
}

module.exports = { safeJsonFromText };

