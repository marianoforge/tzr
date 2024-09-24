export const formatNumber = (number: number) => {
  const parts = number.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // Only add decimal part if it's not "00"
  return parts[1] === "00" ? parts[0] : parts.join(",");
};
