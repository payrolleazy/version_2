import type { ComponentPropsWithoutRef } from 'react';

export function PageFrame({ className = '', ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={`space-y-6 ${className}`.trim()} {...props} />;
}
