'use client';

import { usePathname } from 'next/navigation';
import HeaderClient from './header-client';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function Header() {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/vision');

  if (isDashboardRoute) {
    return (
      <SidebarProvider defaultOpen={false}>
        <HeaderClient isDashboardRoute={isDashboardRoute} />
      </SidebarProvider>
    );
  }

  return <HeaderClient isDashboardRoute={isDashboardRoute} />;
}
