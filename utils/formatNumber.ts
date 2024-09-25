export const formatNumber = (
  number: number | string,
  isPercentage?: boolean
) => {
  const num = typeof number === "string" ? parseFloat(number) : number;
  const parts = num.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Only add decimal part if it's not "00"
  const formattedNumber = parts[1] === "00" ? parts[0] : parts.join(",");
  // Add percentage symbol as suffix if isPercentage is true
  return isPercentage ? `${formattedNumber}%` : formattedNumber;
};
