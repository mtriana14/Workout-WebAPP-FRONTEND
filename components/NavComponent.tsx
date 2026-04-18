"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { NavItem } from "@/router/router";

interface NavComponentProps {
  NAV_ITEMS: NavItem[];
}

function isLucideIcon(icon: NavItem["icon"]): icon is LucideIcon {
  return typeof icon === "function";
}

export default function NavComponent({ NAV_ITEMS }: NavComponentProps) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="hh-sidebar__nav" aria-label="Portal navigation">
        {NAV_ITEMS.map((item) => (
          (() => {
            const isActive = item.active || pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`hh-nav-link${isActive ? " hh-nav-link--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {isLucideIcon(item.icon) ? (
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                ) : (
                  <img src={item.icon} alt="" width={16} height={16} style={{ flexShrink: 0 }} />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })()
        ))}
      </nav>
    </div>
  );
}
