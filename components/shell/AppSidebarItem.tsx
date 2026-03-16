'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { PortalNavItem } from '@/lib/navigation/portal-nav';

export function AppSidebarItem({ item }: { item: PortalNavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <div className="rounded-[1.4rem] border border-slate-200/70 bg-white/80 p-3 shadow-[var(--shadow-card)]">
      <Link
        href={item.href}
        className={`flex items-center justify-between rounded-[1rem] px-4 py-3 transition ${
          isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-700 hover:bg-slate-100/80'
        }`}
      >
        <span className="font-semibold">{item.label}</span>
      </Link>
      {item.children?.length ? (
        <div className="mt-3 space-y-2 pl-2">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

            return (
              <Link
                key={child.href}
                href={child.href}
                className={`block rounded-[0.9rem] px-3 py-2 text-sm transition ${
                  childActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
