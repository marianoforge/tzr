import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  marginBottom?: string;
  marginTop?: string;
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  isPasswordVisible?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      marginBottom = 'mb-6',
      marginTop = 'mt-1',
      label,
      error,
      showPasswordToggle,
      onTogglePassword,
      isPasswordVisible,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${marginBottom} ${marginTop}`}>
        {label && (
          <label className="font-semibold text-mediumBlue">{label}</label>
        )}
        <div className="relative mt-2">
          <input
            ref={ref}
            className={`${
              className || 'w-full p-2 border border-gray-300 rounded'
            }`}
            {...props}
            type={showPasswordToggle && isPasswordVisible ? 'text' : props.type}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-2 top-3"
            >
              {isPasswordVisible ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-redAccent">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
