'use client';

import { useState, useEffect } from 'react';

export function usePWADetection(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const check = () => {
      if (mediaQuery.matches) return true;
      if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
      return false;
    };

    setIsStandalone(check());
    const handler = () => setIsStandalone(check());
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isStandalone;
}
