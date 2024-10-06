import React from "react";
import Link from "next/link";

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, label, icon }) => (
  <Link
    href={href}
    className="hover:text-[#2d3748] px-3 py-2 rounded transition duration-150 ease-in-out w-full flex items-center justify-start"
  >
    {icon}
    {label}
  </Link>
);
