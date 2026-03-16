import { PublicSectionCard } from '@/components/public/PublicSection';

const PANELS = [
  {
    title: 'Use the issued identity',
    text: 'The application should rely on the same issued account and role assignment that already exists in the operational backend.',
  },
  {
    title: 'Do not pick a portal manually',
    text: 'The user should not need to decide which workspace they belong to. The application should decide after authentication.',
  },
  {
    title: 'Recover through the controlled path',
    text: 'Password reset, invitation mismatch, and blocked-access states should stay on the hardened auth path.',
  },
] as const;

export function SignInGuidancePanels() {
  return (
    <PublicSectionCard className="border-slate-900/85 bg-slate-950 p-7 text-white sm:p-9">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-200/85">Guidance</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-white">The sign-in experience should remove role confusion, not create it.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {PANELS.map((panel) => (
            <div key={panel.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-2xl font-black tracking-tight text-white">{panel.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{panel.text}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}
