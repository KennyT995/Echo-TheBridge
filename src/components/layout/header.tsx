'use client';

import { usePathname } from 'next/navigation';
import HeaderClient from './header-client';

export default function Header() {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/vision');

  return <HeaderClient isDashboardRoute={isDashboardRoute} />;
}
