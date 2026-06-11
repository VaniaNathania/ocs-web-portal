export function formatAmount(value: number): string {
  return (value / 100000).toFixed(5);
}

export const formatWithLabel = (value: number) => {
  const formatted = formatAmount(value).replace("-", "Credit ");

  return value > 0 ? `Decrease ${formatted}` : formatted;
};
