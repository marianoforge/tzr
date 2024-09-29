import React from "react";

interface TextAreaProps {
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  required?: boolean;
  rows?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  name,
  placeholder,
  value,
  onChange,
  className,
  required,
  rows,
}) => {
  return (
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className || "w-full p-2 mb-4 border border-gray-300 rounded"}
      required={required}
      rows={rows || 4}
    ></textarea>
  );
};

export default TextArea;
