"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", href: "/" },
  { key: "rules", label: "Rules", href: "/rules" },
  { key: "vulnerabilities", label: "Vulnerabilities", href: "/vulnerabilities" },
  { key: "trend", label: "Trend", href: "/trend" },
];

const SETTINGS_HREF = "/settings";

export default function RailNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href);

  const railItemClass = (href: string) => `rail-item${isActive(href) ? " active" : ""}`;

  return (
    <nav className="rail-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={railItemClass(item.href)}
          aria-label={item.label}
          title={item.label}
        >
          <span className="label">{item.label}</span>
        </Link>
      ))}
      <Link
        href={SETTINGS_HREF}
        className={railItemClass(SETTINGS_HREF)}
        aria-label="Settings"
        title="Settings"
      >
        <span className="label">Settings</span>
      </Link>
    </nav>
  );
}
