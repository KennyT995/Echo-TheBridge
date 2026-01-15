import AppSidebar from '@/components/layout/app-sidebar';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';

export default function VisionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex w-full">
                <Sidebar>
                    <AppSidebar />
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-border/60" />
                        {/* Breadcrumbs or Title could go here */}
                    </header>
                    {children}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
