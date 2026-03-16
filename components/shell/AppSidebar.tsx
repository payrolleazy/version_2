import type { PortalBootstrap } from '@/lib/bootstrap/portal-bootstrap';
import { PORTAL_LABEL } from '@/lib/auth/role-map';
import { AppSidebarTree } from '@/components/shell/AppSidebarTree';
import { SurfaceCard } from '@/components/ui/SurfaceCard';

export function AppSidebar({ bootstrap }: { bootstrap: PortalBootstrap }) {
  return (
    <aside className="flex h-full flex-col gap-4">
      <SurfaceCard className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-600">{PORTAL_LABEL[bootstrap.portal]}</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Workspace</h2>
        <p className="mt-2 text-sm text-slate-600">
          Server-validated shell with shared parent and child navigation.
        </p>
      </SurfaceCard>
      <AppSidebarTree items={bootstrap.navigation} />
    </aside>
  );
}
