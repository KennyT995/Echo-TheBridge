'use client';

import AppSidebar from '@/components/layout/app-sidebar';

export default function VisionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex">
      <aside className="hidden md:block w-64 border-r">
        <AppSidebar />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
