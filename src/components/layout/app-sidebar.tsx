'use client';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gem, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Vision } from '@/lib/types';
import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/plans',
    label: 'Plans',
    icon: Gem,
  },
];

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}


export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const visionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'visions'),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: visions, isLoading: visionsLoading } = useCollection<Vision>(visionsQuery);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Menu</SidebarGroupLabel>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.path}
                tooltip={item.label}
              >
                <Link href={item.path}>
                  <item.icon suppressHydrationWarning />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="mt-auto p-0">
        <ClientOnly>
          {visionsLoading && (
            <div className="p-2">
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </div>
          )}
        </ClientOnly>

        {!visionsLoading && visions && visions.length > 0 && (
          <Accordion type="single" collapsible className="w-full" defaultValue='my-visions'>
            <AccordionItem value="my-visions" className='border-none'>
              <AccordionTrigger className="p-2 text-sm font-medium text-sidebar-foreground/90 hover:text-sidebar-foreground hover:no-underline hover:bg-sidebar-accent rounded-md [&[data-state=open]]:bg-sidebar-accent">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" suppressHydrationWarning />
                  <span>My Visions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className='space-y-1 pl-8 pr-2 py-2'>
                  {visions.map((vision) => (
                    <li key={vision.id}>
                      <Link
                        href={`/vision/${vision.id}`}
                        className={cn("block text-sm rounded-md p-2 hover:bg-sidebar-accent", pathname === `/vision/${vision.id}` ? 'bg-sidebar-accent font-semibold' : '')}
                      >
                        {vision.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

      </SidebarGroup>
    </SidebarContent>
  );
}
