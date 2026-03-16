import type { PortalNavItem } from '@/lib/navigation/portal-nav';
import { AppSidebarItem } from '@/components/shell/AppSidebarItem';

export function AppSidebarTree({ items }: { items: PortalNavItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <AppSidebarItem key={item.href} item={item} />
      ))}
    </div>
  );
}
