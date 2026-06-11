export const ROUND_WAY_OPTIONS = [
  { value: 1, label: "Round Down" },
  { value: 2, label: "Round Up" },
  { value: 3, label: "Round Off" },
] as const;

export const ROUND_WAY_MAP = Object.fromEntries(
  ROUND_WAY_OPTIONS.map((item) => [item.value, item.label])
);
