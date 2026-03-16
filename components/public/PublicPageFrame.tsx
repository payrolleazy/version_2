import type { ComponentPropsWithoutRef } from 'react';

export function PublicPageFrame({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`mx-auto w-full max-w-[1760px] px-6 py-12 lg:px-8 lg:py-14 ${className}`.trim()} {...props} />;
}
