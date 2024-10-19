import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  marginBottom?: string; // Nueva propiedad para el margen inferior
  marginTop?: string; // Nueva propiedad para el margen superior
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, marginBottom = "mb-6", marginTop = "mt-1", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${
          className || "w-full p-2 border border-gray-300 rounded"
        } ${marginBottom} ${marginTop}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
