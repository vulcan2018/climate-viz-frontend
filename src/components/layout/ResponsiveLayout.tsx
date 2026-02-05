/**
 * Responsive layout wrapper for different screen sizes.
 */

import { useState, useEffect, ReactNode } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveLayoutProps {
  children: ReactNode;
  mobileContent?: ReactNode;
  tabletContent?: ReactNode;
}

function getBreakpoint(width: number): Breakpoint {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function ResponsiveLayout({
  children,
  mobileContent,
  tabletContent,
}: ResponsiveLayoutProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'desktop'
  );

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (breakpoint === 'mobile' && mobileContent) {
    return <>{mobileContent}</>;
  }

  if (breakpoint === 'tablet' && tabletContent) {
    return <>{tabletContent}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to get current breakpoint.
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'desktop'
  );

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to check if mobile view.
 */
export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}
