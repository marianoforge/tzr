import React from 'react';
import { UseFormRegister, Path, FieldValues } from 'react-hook-form'; // Importa FieldValues

// Agregamos 'extends FieldValues' para cumplir con las restricciones de react-hook-form
interface SelectProps<T extends FieldValues> {
  label: string;
  options: { value: string; label: string }[];
  register: UseFormRegister<T>;
  name: Path<T>; // Usamos Path<T> para asegurarnos de que sea una ruta válida dentro de T
  required?: boolean;
  className?: string;
  mb?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  defaultValue?: string;
  placeholder?: string;
}

const Select = <T extends FieldValues>({
  label,
  options,
  register,
  placeholder,
  name,
  required = false,
  className = '',
  mb = '-mb-2',
  error,
  onChange,
  defaultValue,
}: SelectProps<T>) => {
  return (
    <div className={mb}>
      <label className="font-semibold text-mediumBlue">{label}</label>
      <select
        {...register(name)} // Utilizamos Path<T> aquí
        className={`block w-full mt-2 mb-4 p-2 border border-gray-300 text-gray-400 rounded ${className}`}
        required={required}
        onChange={onChange}
        defaultValue={defaultValue}
      >
        <option value="" disabled className="text-gray-500">
          {placeholder || label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-redAccent">{error}</p>}
    </div>
  );
};

export default Select;
