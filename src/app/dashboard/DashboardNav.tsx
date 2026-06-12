"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; badge: number; icon: string };

// Icon set (matches the dashboard design handoff). 1.7 stroke, 18px.
const ICONS: Record<string, React.ReactNode> = {
  overview: (<><rect x="3" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.6" /></>),
  requests: (<><path d="M9 11l3 3 8-8" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>),
  clients: (<><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3 3 0 0 1 0 6" /><path d="M17 14.2a6.5 6.5 0 0 1 4.5 5.8" /></>),
  services: (<path d="M3 12h4l2 6 4-14 2 8h6" />),
  hours: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  notifs: (<><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>),
  editor: (<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
  subscription: (<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
  support: (<><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5" /><path d="M12 17.4h.01" /></>),
  analytics: (<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M21 20H3" /></>),
  blog: (<><path d="M4 4h11l5 5v11H4z" /><path d="M14 4v5h5" /><path d="M8 13h7M8 16h7" /></>),
  domain: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></>),
};

export default function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));

  return (
    <nav className="mt-2 flex flex-col gap-0.5">
      {items.map((n) => {
        const active = isActive(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] transition ${
              active ? "bg-accent/10 font-semibold text-accent" : "text-[#5b6b75] hover:bg-[#f1f5f6]"
            }`}
            style={active ? { boxShadow: "inset -3px 0 0 var(--accent)" } : undefined}
          >
            <span className={active ? "text-accent" : "text-[#7c8a93]"}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[n.icon] ?? ICONS.overview}
              </svg>
            </span>
            <span className="flex-1">{n.label}</span>
            {n.badge > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">{n.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
