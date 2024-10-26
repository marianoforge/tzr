export const formatNumber = (
  number: number | string,
  isPercentage?: boolean
) => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(num)) {
    return null;
  }
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formattedNumber = parts[1] === '00' ? parts[0] : parts.join(',');
  return isPercentage ? `${formattedNumber}%` : formattedNumber;
};
