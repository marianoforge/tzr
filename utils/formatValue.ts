import { formatNumber } from "./formatNumber";

export const formatValue = (
  value: number | string,
  format: "percentage" | "currency" | "none" = "none"
) => {
  if (value === "No Data") return "No Data";

  const numValue = Number(value);
  switch (format) {
    case "percentage":
      return formatNumber(numValue, true);
    case "currency":
      return `$${formatNumber(numValue)}`;
    default:
      return formatNumber(numValue);
  }
};
