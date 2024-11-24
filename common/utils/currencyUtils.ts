import currencyCodes from 'currency-codes';
import getSymbolFromCurrency from 'currency-symbol-map';

// Lista de países en las tres Américas
const americasCountries = [
  ...Array.from(
    new Set([
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
      'Belize',
      'Costa Rica',
      'El Salvador',
      'Guatemala',
      'Honduras',
      'Nicaragua',
      'Panama',
      'Canada',
      'Mexico',
      'United States',
      'Bermuda',
      'Greenland',
      'Cuba',
    ])
  ),
];

// Función para obtener monedas de las Américas con símbolos
export const getCurrenciesForAmericas = () => {
  return currencyCodes.data
    .filter((currency) =>
      currency.countries.some((country) => americasCountries.includes(country))
    )
    .map((currency) => ({
      code: currency.code,
      name: currency.currency,
      symbol: getSymbolFromCurrency(currency.code) || currency.code,
    }));
};
