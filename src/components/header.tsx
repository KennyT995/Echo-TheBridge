'use client';

import { useAuth, useUser } from '@/firebase';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from './ui/sidebar';
import { Rocket } from 'lucide-react';

export default function Header() {
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
         <div className="mr-4 flex items-center">
          <SidebarTrigger className="md:hidden"/>
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block font-headline">
              Vision Bridge
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          {!isUserLoading &&
            (user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/login">Login / Sign Up</Link>
              </Button>
            ))}
        </div>
      </div>
    </header>
  );
}
