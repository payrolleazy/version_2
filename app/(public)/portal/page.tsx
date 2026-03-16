import { redirect } from 'next/navigation';
import { getServerAuthSnapshot } from '@/lib/auth/session';
import { resolvePortalDestination } from '@/lib/auth/portal-routing';
import { PORTAL_LABEL } from '@/lib/auth/role-map';
import { PublicPageFrame } from '@/components/public/PublicPageFrame';
import { PublicSection, PublicSectionCard } from '@/components/public/PublicSection';
import { ActionLink } from '@/components/ui/ActionButton';
import { SignOutButton } from '@/components/auth/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function PortalResolvePage() {
  const snapshot = await getServerAuthSnapshot();

  if (!snapshot.session) {
    redirect('/signin');
  }

  const resolution = await resolvePortalDestination(snapshot);

  if (resolution.kind === 'allowed') {
    redirect(resolution.href);
  }

  const requestedPortalLabel = resolution.requestedPortal ? PORTAL_LABEL[resolution.requestedPortal] : null;
  const hasSuggestions = resolution.suggestedPortals.length > 0;

  return (
    <PublicPageFrame>
      <PublicSection>
        <PublicSectionCard className="border-amber-200/80 bg-gradient-to-br from-white via-amber-50/70 to-slate-50">
          <div className="space-y-5">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-amber-700">
              {requestedPortalLabel ? `${requestedPortalLabel} access restricted` : 'Workspace unavailable'}
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-[3rem]">
                {requestedPortalLabel
                  ? `This session was opened for ${requestedPortalLabel}, but that workspace is not available for this account.`
                  : 'This signed-in account does not yet have a migrated portal in the new application.'}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600">
                {hasSuggestions
                  ? 'The system did not redirect you to another portal. Sign out and re-enter using one of the valid workspaces below.'
                  : 'No valid migrated workspace was resolved for this signed-in session.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <SignOutButton />
              {resolution.suggestedPortals.map((portal) => (
                <SignOutButton key={portal} redirectTo={`/signin?portal=${portal}`}>
                  {`Sign out and use ${PORTAL_LABEL[portal]}`}
                </SignOutButton>
              ))}
              <ActionLink href="/" variant="secondary">Return to public landing</ActionLink>
            </div>
          </div>
        </PublicSectionCard>
      </PublicSection>
    </PublicPageFrame>
  );
}
