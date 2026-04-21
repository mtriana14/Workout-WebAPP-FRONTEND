"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavItem } from "@/router/router";

interface NavComponentProps {
  NAV_ITEMS: NavItem[];
}

export default function NavComponent({ NAV_ITEMS }: NavComponentProps) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="hh-sidebar__nav" aria-label="Portal navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = item.active || pathname === item.href;
          const Icon = item.icon; // Extract component to render it cleanly

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`hh-nav-link${isActive ? " hh-nav-link--active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}