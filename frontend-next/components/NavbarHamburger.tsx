import React from "react";
import Link from "next/link";
import ConnectWallet from "./ConnectWallet";

type NavbarHamburgerItemProps = {
  label: string;
  href: string;
};

const NavbarHamburgerItem = ({ label, href }: NavbarHamburgerItemProps) => {
  return (
    <Link
      href={href}
      title=""
      className="flex items-center p-3 -m-3 text-base font-medium text-gray-900 transition-all duration-200 rounded-xl hover:bg-gray-50 focus:outline-none font-pj focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
    >
      {" "}
      {label}{" "}
    </Link>
  );
};

function NavbarHamburger() {
  return (
    <nav>
      <div className="px-1 py-8">
        <div className="grid gap-y-7">
          <NavbarHamburgerItem label="Dự án" href="/causes" />
          <NavbarHamburgerItem label="Cửa hàng" href="/shop" />
          <NavbarHamburgerItem label="Cộng đồng" href="/community" />
          <NavbarHamburgerItem label="Giới thiệu" href="/about" />
          <NavbarHamburgerItem label="Bảng điều khiển" href="/dashboard" />
          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
}

export default NavbarHamburger;
