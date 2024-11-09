// components/AddressAutocompleteManual.tsx
import React, { useState, useEffect } from 'react';
import { usePlacesAutocomplete } from '@/common/hooks/useAutocompleteSuggestions';
import Input from '@/components/PrivateComponente/FormComponents/Input';

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    address: string;
    city: string | null;
    province: string | null;
    country: string | null;
  }) => void;
  onHouseNumberChange: (houseNumber: string) => void;
}

export default function AddressAutocompleteManual({
  onAddressSelect,
  onHouseNumberChange,
}: AddressAutocompleteProps) {
  const [value, setValue] = useState('');
  const [houseNumber, setHouseNumber] = useState<string>('');
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    data: suggestions,
    isError,
    error: queryError,
  } = usePlacesAutocomplete(value);

  // Handle errors from the query
  useEffect(() => {
    if (isError && queryError instanceof Error) {
      setError(queryError.message);
    }
  }, [isError, queryError]);

  const handleSelectSuggestion = async (
    description: string,
    placeId: string
  ) => {
    setValue(description);
    setIsDropdownOpen(false);

    try {
      const response = await fetch(`/api/places/details?placeId=${placeId}`);
      const data = await response.json();
      if (data.status === 'OK') {
        const addressComponents = data.result.address_components;

        const countryComponent = addressComponents.find((comp: any) =>
          comp.types.includes('country')
        );
        const localityComponent = addressComponents.find((comp: any) =>
          comp.types.includes('locality')
        );
        const provinceComponent = addressComponents.find((comp: any) =>
          comp.types.includes('administrative_area_level_1')
        );

        const selectedAddress = {
          address: description,
          country: countryComponent?.long_name || null,
          city: localityComponent?.long_name || null,
          province: provinceComponent?.long_name || null,
        };

        setCountry(selectedAddress.country);
        setCity(selectedAddress.city);
        setProvince(selectedAddress.province);
        onAddressSelect(selectedAddress); // Send data to parent form
        setError(null);
      } else {
        setError(`Error in Details API: ${data.status}`);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setError('Failed to fetch place details.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError(null);
    setIsDropdownOpen(true);
  };

  const handleHouseNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHouseNumber(e.target.value);
    onHouseNumberChange(e.target.value);
  };

  return (
    <div>
      <Input
        label="Dirección de la Operación"
        value={value}
        onChange={handleInputChange}
        placeholder="Enter an address"
        className="p-2 border rounded w-full"
        error={error || undefined}
      />
      {isDropdownOpen && suggestions && suggestions.length > 0 && (
        <ul className="border rounded mt-1">
          {suggestions.map((suggestion: any) => (
            <li
              key={suggestion.place_id}
              onClick={() =>
                handleSelectSuggestion(
                  suggestion.description,
                  suggestion.place_id
                )
              }
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
      <Input
        label="Número de Apto o Casa"
        value={houseNumber}
        onChange={handleHouseNumberInputChange}
        placeholder="Por Ejemplo: Piso 4 - Apto D"
        className="p-2 border rounded w-full"
      />
      {country && city && province && (
        <div className="-mt-2 mb-4">
          <p>
            <strong>Localidad:</strong> {city}
          </p>
          <p>
            <strong>Provincia:</strong> {province}
          </p>
          <p>
            <strong>Pais:</strong> {country}
          </p>
        </div>
      )}
    </div>
  );
}
