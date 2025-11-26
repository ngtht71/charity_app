import React from "react";
import Link from "next/link";
import ConnectWallet from "./ConnectWallet";

type NavbarItemProps = {
  label: string;
  href: string;
};

const NavbarItem = ({ label, href }: NavbarItemProps) => {
  return (
    <Link
      href={href}
      title=""
      className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
    >
      {" "}
      {label}{" "}
    </Link>
  );
};

function Navbar() {
  return (
    <>
      <nav className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-12">
        <NavbarItem label="Dự án" href="/causes" />
        <NavbarItem label="Cửa hàng" href="/shop" />
        <NavbarItem label="Cộng đồng" href="/community" />
        <NavbarItem label="Giới thiệu" href="/about" />
      </nav>
      <nav className="hidden lg:flex lg:items-center lg:justify-end lg:space-x-10">
        <NavbarItem label="Bảng điều khiển" href="/dashboard" />
        <ConnectWallet />
      </nav>
    </>
  );
}

export default Navbar;
