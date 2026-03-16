import type { PortalBootstrap } from '@/lib/bootstrap/portal-bootstrap';
import { AppShellProvider } from '@/components/shell/AppShellContext';
import { AppTopNav } from '@/components/shell/AppTopNav';
import { AppSidebar } from '@/components/shell/AppSidebar';

export function AppShell({ bootstrap, children }: { bootstrap: PortalBootstrap; children: React.ReactNode }) {
  return (
    <AppShellProvider>
      <div className="min-h-screen px-6 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto grid max-w-[1800px] gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <AppSidebar bootstrap={bootstrap} />
          </div>
          <div className="space-y-6">
            <AppTopNav bootstrap={bootstrap} />
            <main>{children}</main>
          </div>
        </div>
      </div>
    </AppShellProvider>
  );
}
