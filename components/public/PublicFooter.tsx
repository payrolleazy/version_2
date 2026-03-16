import Link from 'next/link';
import { BrandWordmark } from '@/components/BrandWordmark';

const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/onboarding', label: 'Onboarding' }
    ]
  },
  {
    title: 'Access',
    links: [
      { href: '/signin', label: 'Sign in' },
      { href: '/signup', label: 'Sign up' },
      { href: '/purchase', label: 'Purchase' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' }
    ]
  }
];

export function PublicFooter() {
  return (
    <footer className="border-t border-white/60 bg-white/70">
      <div className="mx-auto grid w-full max-w-[1760px] gap-10 px-6 py-10 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div className="space-y-4">
          <BrandWordmark textClassName="text-sm font-black tracking-tight text-sky-700" />
          <h2 className="max-w-xl text-2xl font-black tracking-tight text-slate-950">
            Built for guided onboarding, fast migration, and strongly separated application portals.
          </h2>
          <p className="max-w-2xl text-sm text-slate-600">
            The public layer routes new clients toward onboarding and purchase, while existing users move directly into the protected application.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{group.title}</p>
              <div className="space-y-2">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="block text-sm font-medium text-slate-700 transition hover:text-slate-950">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
