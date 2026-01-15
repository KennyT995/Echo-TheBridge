import AppSidebar from '@/components/layout/app-sidebar';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar>
          <AppSidebar />
        </Sidebar>
        <SidebarInset>
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
