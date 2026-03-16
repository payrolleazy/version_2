import Link from 'next/link';

type Variant = 'primary' | 'secondary';

const variantClassMap: Record<Variant, string> = {
  primary:
    'border-transparent bg-gradient-to-r from-[var(--primary-start)] via-[var(--primary-mid)] to-[var(--primary-end)] text-slate-950 shadow-[var(--shadow-card)]',
  secondary: 'border border-slate-200/80 bg-white text-slate-800',
};

export function ActionButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[1.05rem] px-5 py-3 font-semibold transition hover:-translate-y-0.5 ${variantClassMap[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function ActionLink({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: Variant }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-[1.05rem] px-5 py-3 font-semibold transition hover:-translate-y-0.5 ${variantClassMap[variant]}`.trim()}
    >
      {children}
    </Link>
  );
}
