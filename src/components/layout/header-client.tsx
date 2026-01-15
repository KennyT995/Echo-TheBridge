'use client';

import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import { UserNav } from './user-nav';
import AppSidebar from './app-sidebar';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';

interface HeaderClientProps {
  isDashboardRoute: boolean;
}

export default function HeaderClient({ isDashboardRoute }: HeaderClientProps) {
  const { user, isUserLoading } = useUser();

  const renderDesktopNav = () => {
    if (isDashboardRoute) return null;
    return (
      <nav className="hidden md:flex items-center gap-4 text-sm font-medium xl:gap-6">
        <Link
          href="/about"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          About
        </Link>
        <Link
          href="/plans"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          Plans
        </Link>
        <Link
          href="/faq"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          FAQ
        </Link>
        <Link
          href="/contact"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          Contact
        </Link>
      </nav>
    );
  };

  const renderAuthSection = () => {
    if (isUserLoading) return null; // Or a skeleton
    if (user) {
      return <UserNav />;
    }
    if (!isDashboardRoute) {
      return (
        <Button asChild>
          <Link href="/login">Login / Sign Up</Link>
        </Button>
      );
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          {isDashboardRoute && (
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          )}
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Echo: The Bridge Logo"
              width={32}
              height={32}
              className="object-contain"
              suppressHydrationWarning
            />
            <span className="font-bold hidden sm:inline-block font-headline">
              Echo: The Bridge
            </span>
          </Link>
          {renderDesktopNav()}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {renderAuthSection()}
        </div>
      </div>
    </header>
  );
}
