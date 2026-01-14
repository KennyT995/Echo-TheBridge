'use client';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gem, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Vision } from '@/lib/types';

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
              <Link href={item.path} passHref>
                <SidebarMenuButton
                  as="a"
                  isActive={pathname === item.path}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
      
      <SidebarGroup className="mt-auto">
        <SidebarGroupLabel className="flex items-center">
            <Rocket className="mr-2" />
            My Visions
        </SidebarGroupLabel>
         <SidebarMenu>
          {visionsLoading && (
            <>
                <SidebarMenuSkeleton showIcon />
                <SidebarMenuSkeleton showIcon />
            </>
          )}
          {visions && visions.length > 0 && (
             <SidebarMenuItem>
                <SidebarMenuButton
                    isCollapsible={false}
                    className="group/sub-trigger"
                >
                    <Rocket />
                    <span>My Visions</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                {visions.map((vision) => (
                    <SidebarMenuSubItem key={vision.id}>
                        <Link href={`/vision/${vision.id}`} passHref>
                            <SidebarMenuSubButton as="a" isActive={pathname === `/vision/${vision.id}`}>
                                {vision.title}
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                ))}
                </SidebarMenuSub>
             </SidebarMenuItem>
          )}
         </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
