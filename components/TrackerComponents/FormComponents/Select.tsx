import React from "react";
import { UseFormRegister } from "react-hook-form";

interface SelectProps {
  label: string;
  options: { value: string; label: string }[];
  register: UseFormRegister<any>;
  name: string;
  required?: boolean;
  className?: string;
  mb?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Added onChange property
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  register,
  name,
  required = false,
  className = "",
  mb = "-mb-2", // Valor por defecto para margen inferior
  error, // Añadido para manejar errores
  onChange, // Destructure onChange
}) => {
  return (
    <div className={mb}>
      <label className="font-semibold text-mediumBlue">{label}</label>
      <select
        {...register(name)}
        className={`block w-full mt-2 mb-4 p-2 border border-gray-300 text-gray-400 rounded ${className}`}
        required={required}
        onChange={onChange} // Use onChange
      >
        <option value="" disabled selected className="text-gray-500">
          {label}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
};

export default Select;
