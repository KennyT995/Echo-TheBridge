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
} from '@/components/ui/sheet';
import { UserNav } from './user-nav';
import AppSidebar from './app-sidebar';

interface HeaderClientProps {
  isDashboardRoute: boolean;
}

export default function HeaderClient({ isDashboardRoute }: HeaderClientProps) {
  const { user, isUserLoading } = useUser();

  const desktopNav = (
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

  const authSection = (
    <div className="flex items-center gap-2">
      {isUserLoading ? (
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      ) : user ? (
        <UserNav />
      ) : (
        <Button asChild>
          <Link href="/login">Login / Sign Up</Link>
        </Button>
      )}
    </div>
  );

  const dashboardMenu = (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <AppSidebar />
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
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
          {!isDashboardRoute && desktopNav}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {authSection}
          {isDashboardRoute && user && dashboardMenu}
        </div>
      </div>
    </header>
  );
}
