export const DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest";

const SLOW_OR_RETIRED = new Set([
  "gemma-4-31b-it",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
]);

/** Route slow/retired models to the fast production model. */
export function normalizeGeminiModel(model: unknown): string {
  if (typeof model !== "string" || !model.trim()) return DEFAULT_GEMINI_MODEL;
  const normalized = model.trim().replace(/^models\//, "");
  if (SLOW_OR_RETIRED.has(normalized) || normalized.includes("preview-06-17") || /^gemini-3\.5/.test(normalized)) {
    return DEFAULT_GEMINI_MODEL;
  }
  return normalized;
}
