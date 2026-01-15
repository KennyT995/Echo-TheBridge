'use client';

import AppSidebar from '@/components/layout/app-sidebar';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';

export default function VisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
}
