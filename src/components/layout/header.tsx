'use client';

import { usePathname } from 'next/navigation';
import HeaderClient from './header-client';

export default function Header() {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/vision') ||
    pathname.startsWith('/account');

  return <HeaderClient isDashboardRoute={isDashboardRoute} />;
}
