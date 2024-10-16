import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={
          className || "w-full p-2 mb-8 border border-gray-300 rounded"
        }
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
