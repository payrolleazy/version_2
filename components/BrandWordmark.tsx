type BrandWordmarkProps = {
  className?: string;
  textClassName?: string;
  badgeClassName?: string;
  glyphClassName?: string;
};

export function BrandWordmark({
  className = '',
  textClassName = '',
  badgeClassName = '',
  glyphClassName = '',
}: BrandWordmarkProps) {
  return (
    <span aria-label="Payrolleazy" className={`inline-flex items-center ${className}`.trim()}>
      <span className={textClassName}>Payrollea</span>
      <span
        className={`mx-[0.1em] inline-flex h-[0.92em] w-[0.92em] items-center justify-center rounded-[0.22em] bg-amber-400 shadow-[0_0_0_1px_rgba(255,255,255,0.14)] ${badgeClassName}`.trim()}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 18 18"
          className={`h-[0.72em] w-[0.72em] text-slate-950 ${glyphClassName}`.trim()}
          fill="currentColor"
        >
          <path d="M11.5 2 5.4 7.4h3.8L7.1 15.1l7.1-6.3h-4.1Z" />
        </svg>
      </span>
      <span className={textClassName}>y</span>
    </span>
  );
}
