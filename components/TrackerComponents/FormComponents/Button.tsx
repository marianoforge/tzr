import React from "react";

interface ButtonProps {
  type: "button" | "submit" | "reset";
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type,
  className,
  onClick,
  children,
}) => {
  return (
    <button
      type={type}
      className={`${
        className || "bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      } !cursor-pointer`} // Ensure cursor-pointer is applied
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
