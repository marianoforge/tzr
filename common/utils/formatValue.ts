import { formatNumber } from './formatNumber';

export const formatValue = (
  value: number | string,
  format: 'percentage' | 'currency' | 'none' = 'none'
) => {
  if (value === 'No Data') return 'No Data';

  const numValue = Number(value);
  const isNegative = numValue < 0;

  switch (format) {
    case 'percentage':
      return formatNumber(numValue, true);
    case 'currency':
      // For negative currency values, put the minus sign before the currency symbol
      return isNegative
        ? `-$${formatNumber(Math.abs(numValue))}`
        : `$${formatNumber(numValue)}`;
    default:
      return formatNumber(numValue);
  }
};

export const formatNumberValue = (
  value: number,
  format: 'percentage' | 'currency' | 'none' = 'none'
) => {
  const numValue = Number(value);
  const isNegative = numValue < 0;

  switch (format) {
    case 'percentage':
      return formatNumber(numValue, true);
    case 'currency':
      // For negative currency values, put the minus sign before the currency symbol
      return isNegative
        ? `-$${formatNumber(Math.abs(numValue))}`
        : `$${formatNumber(numValue)}`;
    default:
      return formatNumber(numValue);
  }
};
