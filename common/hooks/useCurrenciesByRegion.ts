import { useMemo } from 'react';

import { getCurrenciesForAmericas } from '../utils/currencyUtils';

export const useCurrenciesForAmericas = () => {
  const currencies = useMemo(() => getCurrenciesForAmericas(), []);
  return { currencies };
};
