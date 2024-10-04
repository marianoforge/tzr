import { NavButtonProps } from "@/types";

export const NavButton: React.FC<NavButtonProps> = ({
  onClick,
  label,
  fullWidth = false,
}) => (
  <button
    onClick={onClick}
    className={`text-white hover:bg-[#3A6D8A] px-3 py-2 rounded transition duration-150 ease-in-out ${
      fullWidth ? "w-full text-center" : ""
    }`}
  >
    {label}
  </button>
);
