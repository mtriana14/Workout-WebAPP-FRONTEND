import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { NavItem } from "@/router/router";

interface NavComponentProps {
  NAV_ITEMS: NavItem[];
}

function isLucideIcon(icon: NavItem["icon"]): icon is LucideIcon {
  return typeof icon === "function";
}

export default function NavComponent({ NAV_ITEMS }: NavComponentProps) {
  return (
    <div>
      <nav className="hh-sidebar__nav" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`hh-nav-link${item.active ? " hh-nav-link--active" : ""}`}
            aria-current={item.active ? "page" : undefined}
          >
            {isLucideIcon(item.icon) ? (
              <item.icon size={16} style={{ flexShrink: 0 }} />
            ) : (
              <img src={item.icon} alt="" width={16} height={16} style={{ flexShrink: 0 }} />
            )}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
