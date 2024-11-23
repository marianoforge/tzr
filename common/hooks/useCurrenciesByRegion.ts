import { useState, useMemo } from 'react';
import currencyCodes from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';

// Definir las regiones con sus países
const regions = {
  SouthAmerica: [
    'Argentina',
    'Bolivia',
    'Brazil',
    'Chile',
    'Colombia',
    'Ecuador',
    'Guyana',
    'Paraguay',
    'Peru',
    'Suriname',
    'Uruguay',
    'Venezuela',
  ],
  CentralAmerica: [
    'Belize',
    'Costa Rica',
    'El Salvador',
    'Guatemala',
    'Honduras',
    'Nicaragua',
    'Panama',
  ],
  NorthAmerica: ['Canada', 'Mexico', 'United States', 'Bermuda', 'Greenland'],
};

// Filtrar monedas por región y agregar símbolos
const filterCurrenciesByRegion = (region: keyof typeof regions) => {
  const countriesInRegion = regions[region] || [];
  return currencyCodes.data
    .filter((currency) =>
      currency.countries.some((country) => countriesInRegion.includes(country))
    )
    .map((currency) => ({
      ...currency,
      symbol: getSymbolFromCurrency(currency.code) || currency.code, // Agrega el símbolo
    }));
};

// Hook personalizado
export const useCurrenciesByRegion = (initialRegion: keyof typeof regions) => {
  const [region, setRegion] = useState(initialRegion);

  // Memorizar las monedas filtradas
  const currencies = useMemo(() => filterCurrenciesByRegion(region), [region]);

  return { region, setRegion, currencies };
};
