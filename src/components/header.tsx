'use client';

import { useAuth, useUser } from '@/firebase';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Vision Bridge
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/plans"
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Plans
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          {!isUserLoading &&
            (user ? (
              <>
                <span className="text-sm text-foreground/80">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            ))}
        </div>
      </div>
    </header>
  );
}
