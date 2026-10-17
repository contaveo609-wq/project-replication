export const DEFAULT_GEMINI_MODEL = "gemma-4-31b-it";

/** Route legacy Gemini configurations to the selected Gemma production model. */
export function normalizeGeminiModel(model: unknown): string {
  if (typeof model !== "string" || !model.trim()) return DEFAULT_GEMINI_MODEL;
  const normalized = model.trim().replace(/^models\//, "");
  return normalized.startsWith("gemini-") ? DEFAULT_GEMINI_MODEL : normalized;
}
