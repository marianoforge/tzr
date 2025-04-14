export const formatNumber = (
  number: number | string,
  isPercentage?: boolean
) => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(num)) {
    return null;
  }

  // Check if the number is negative
  const isNegative = num < 0;
  // Get the absolute value for formatting
  const absNum = Math.abs(num);

  const parts = absNum.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formattedNumber = parts[1] === '00' ? parts[0] : parts.join(',');

  if (isPercentage) {
    return `${isNegative ? '-' : ''}${formattedNumber}%`;
  }

  return isNegative ? `-${formattedNumber}` : formattedNumber;
};
