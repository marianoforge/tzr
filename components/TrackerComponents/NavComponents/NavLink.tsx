import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavLinkProps {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({
  href = '/default-path',
  label,
  icon,
}) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded transition duration-150 ease-in-out w-full flex items-center justify-start ${isActive ? 'bg-lightBlue/15' : 'hover:text-mediumBlue'}`}
    >
      {icon}
      {label}
    </Link>
  );
};
