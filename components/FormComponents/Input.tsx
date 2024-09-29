import React from "react";

interface InputProps {
  type: string;
  name: string;
  placeholder?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  className?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  className,
  required,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className || "w-full p-2 mb-4 border border-gray-300 rounded"}
      required={required}
    />
  );
};

export default Input;
