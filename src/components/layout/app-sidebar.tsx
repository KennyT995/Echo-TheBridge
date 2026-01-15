'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gem, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Vision } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';


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
    <div className="flex flex-col h-full p-4 space-y-4">
        <h3 className="font-bold px-2">Menu</h3>
        <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => (
            <Button key={item.path} variant={pathname === item.path ? "secondary" : "ghost"} className="justify-start gap-2" asChild>
                <Link href={item.path}>
                    <item.icon className="h-4 w-4" suppressHydrationWarning />
                    <span>{item.label}</span>
                </Link>
            </Button>
            ))}
        </nav>
        
        <div className="flex-grow">
            {visionsLoading && (
                <div className="space-y-2 mt-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            )}
            {!visionsLoading && visions && visions.length > 0 && (
            <Accordion type="single" collapsible className="w-full" defaultValue='my-visions'>
                <AccordionItem value="my-visions" className='border-none'>
                <AccordionTrigger className="px-2 py-2 text-sm font-medium hover:bg-muted rounded-md hover:no-underline">
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
                            className={cn("block text-sm rounded-md p-2 hover:bg-muted", pathname === `/vision/${vision.id}` ? 'bg-muted font-semibold' : '')}
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
        </div>
    </div>
  );
}
