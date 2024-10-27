import Link from 'next/link';

interface NavLinkProps {
  href?: string;
  label: string;
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NavButton: React.FC<NavLinkProps> = ({
  href,
  label,
  fullWidth = false,
  onClick,
  className,
}) => (
  <Link
    href={href || ''}
    className={`text-white hover:bg-[#3A6D8A] px-3 py-2 rounded transition duration-150 ease-in-out ${
      fullWidth ? 'w-full text-center' : ''
    } ${className}`}
    onClick={onClick}
  >
    {label}
  </Link>
);
