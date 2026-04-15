import { NavItem } from "@/router/router";

interface NavComponentProps {
  NAV_ITEMS: NavItem[];
}

// 1. Aplicamos destructuring para que el código sea más legible
export default function NavComponent({ NAV_ITEMS }: NavComponentProps) {
  return (
    <div>
      <nav className="hh-sidebar__nav" aria-label="Admin navigation">
        {/* 2. Mapeamos sobre la propiedad correcta */}
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`hh-nav-link${item.active ? " hh-nav-link--active" : ""}`}
            aria-current={item.active ? "page" : undefined}
          >
            <img
              src={item.icon}
              alt="" // Mantenemos alt vacío si el ícono es decorativo
              width={16}
              height={16}
              style={{ flexShrink: 0 }}
            />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}