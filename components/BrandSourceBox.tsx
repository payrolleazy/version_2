import { BrandWordmark } from '@/components/BrandWordmark';

type BrandSourceBoxProps = {
  className?: string;
  wordmarkClassName?: string;
};

export function BrandSourceBox({ className = '', wordmarkClassName = '' }: BrandSourceBoxProps) {
  return (
    <span
      aria-label="Payrolleazy"
      className={[
        'relative inline-flex h-[42px] items-center rounded-[10px] border border-sky-400/70 bg-blue-900 px-4 shadow-[0_10px_22px_rgba(15,23,42,0.14)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="pointer-events-none absolute inset-[1px] rounded-[9px] border border-white/25" />
      <BrandWordmark
        className="relative z-[1]"
        textClassName={['text-[16px] font-bold tracking-tight text-white', wordmarkClassName].filter(Boolean).join(' ')}
      />
    </span>
  );
}
