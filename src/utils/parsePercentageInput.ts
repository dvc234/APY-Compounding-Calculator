/**
 * Normalizes APR input into a decimal (e.g., "12%" -> 0.12, "0.12" -> 0.12).
 * Accepts commas or dots as decimal separators and gracefully handles raw numbers.
 */
export function parsePercentageInput(value: string | number): number {
  if (typeof value === "number") {
    return value > 1 ? value / 100 : value;
  }

  const raw = value.trim().replace(/,/g, ".");
  const hasPercent = raw.endsWith("%");
  const numericPart = hasPercent ? raw.slice(0, -1) : raw;

  const parsed = Number(numericPart);
  if (Number.isNaN(parsed)) return NaN;

  if (hasPercent) return parsed / 100;
  if (parsed > 1) return parsed / 100;
  return parsed;
}
