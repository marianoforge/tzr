import React from 'react';
import Link from 'next/link';

interface NavLinkProps {
  href?: string; // or URL if you want to use the URL type from the standard library
  label: string;
  icon: React.ReactNode;
  onClick?: () => void; // Add this line
}

export const NavLink: React.FC<NavLinkProps> = ({ href, label, icon }) => {
  // Ensure href is defined and of type string
  const validHref: string = href || '/default-path';

  return (
    <Link
      href={validHref}
      className="hover:text-mediumBlue px-3 py-2 rounded transition duration-150 ease-in-out w-full flex items-center justify-start"
    >
      {icon}
      {label}
    </Link>
  );
};
