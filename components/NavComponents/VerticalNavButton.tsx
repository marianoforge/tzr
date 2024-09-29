import { VerticalNavButtonProps } from "@/types";

export const VerticalNavButton: React.FC<VerticalNavButtonProps> = ({
  onClick,
  label,
  icon,
}) => (
  <button
    onClick={onClick}
    className="text-white hover:bg-[#3A6D8A] px-3 py-2 rounded transition duration-150 ease-in-out w-full flex items-center justify-start"
  >
    {icon}
    {label}
  </button>
);
