'use client';

import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
import { SidebarProvider } from '../ui/sidebar';

interface HeaderClientProps {
  isDashboardRoute: boolean;
}

export default function HeaderClient({ isDashboardRoute }: HeaderClientProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {isDashboardRoute && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:mr-2">
                <Menu className="h-5 w-5" suppressHydrationWarning />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[300px]">
                <SidebarProvider>
                    <AppSidebar />
                </SidebarProvider>
            </SheetContent>
          </Sheet>
        )}
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
        </div>

        {/* Desktop Nav for non-dashboard routes */}
        {!isDashboardRoute && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium xl:gap-6">
            <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
            <Link href="/plans" className="transition-colors hover:text-foreground/80 text-foreground/60">Plans</Link>
            <Link href="/faq" className="transition-colors hover:text-foreground/80 text-foreground/60">FAQ</Link>
            <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
            </nav>
        )}
        

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {!isUserLoading &&
            (user ? (
              <>
                <UserNav />
              </>
            ) : (
                !isDashboardRoute && (
                    <Button asChild className="hidden md:inline-flex">
                        <Link href="/login">Login / Sign Up</Link>
                    </Button>
                )
            ))}

          {/* Mobile Menu for non-dashboard routes */}
          {!isDashboardRoute && (
             <Sheet>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" suppressHydrationWarning />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                    <SheetClose asChild>
                    <Link href="/about" className="font-medium hover:text-primary">About</Link>
                    </SheetClose>
                    <SheetClose asChild>
                    <Link href="/plans" className="font-medium hover:text-primary">Plans</Link>
                    </SheetClose>
                    <SheetClose asChild>
                    <Link href="/faq" className="font-medium hover:text-primary">FAQ</Link>
                    </SheetClose>
                    <SheetClose asChild>
                    <Link href="/contact" className="font-medium hover:text-primary">Contact</Link>
                    </SheetClose>
                    <div className="border-t pt-4 mt-2 flex flex-col gap-2">
                    {!isUserLoading && (
                        user ? (
                        <>
                            <SheetClose asChild>
                            <Link href="/dashboard" className="font-medium hover:text-primary">Dashboard</Link>
                            </SheetClose>
                            <SheetClose asChild>
                            <button onClick={handleLogout} className="text-left font-medium hover:text-primary text-muted-foreground w-full">Logout</button>
                            </SheetClose>
                        </>
                        ) : (
                        <SheetClose asChild>
                            <Link href="/login" className="font-medium hover:text-primary">Login / Sign Up</Link>
                        </SheetClose>
                        )
                    )}
                    </div>
                </div>
                </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
