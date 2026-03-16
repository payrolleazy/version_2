import Link from 'next/link';
import { BrandSourceBox } from '@/components/BrandSourceBox';
import { ActionLink } from '@/components/ui/ActionButton';

const NAV_ITEMS = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/onboarding', label: 'Onboarding' }
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1760px] items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-10">
          <Link href="/" className="min-w-0">
            <div className="min-w-0">
              <BrandSourceBox className="truncate" />
            </div>
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ActionLink href="/signin" variant="secondary">
            Sign in
          </ActionLink>
          <ActionLink href="/onboarding">Start onboarding</ActionLink>
        </div>
      </div>
    </header>
  );
}
