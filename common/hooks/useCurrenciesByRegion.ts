import { useMemo } from 'react';

import { getCurrenciesForAmericas } from '../utils/currencyUtils';

// Hook para obtener las monedas de las Américas
export const useCurrenciesForAmericas = () => {
  const currencies = useMemo(() => getCurrenciesForAmericas(), []);
  return { currencies };
};
