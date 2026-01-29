"use client";
import { useState } from "react";
import { useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { UserNav } from "./user-nav";
import AppSidebar from "./app-sidebar";
import { InstallPrompt } from "@/components/pwa/install-prompt";

import { mainNavLinks } from "@/lib/navigation";

export default function HeaderClient() {
  const { user, isUserLoading } = useUser();
  const [open, setOpen] = useState(false);

  const authSection = (
    <div className="hidden md:flex items-center gap-2">
      <InstallPrompt />
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
            />
            <span className="font-bold hidden sm:inline-block font-headline">
              Echo: The Bridge
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium xl:gap-6">
            {mainNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
          {authSection}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation menu for accessing pages and user account.
                </SheetDescription>
              </SheetHeader>
              {user ? (
                <AppSidebar onLinkClick={() => setOpen(false)} />
              ) : (
                <div className="flex flex-col h-full">
                  <nav className="flex flex-col gap-2 p-4">
                    {mainNavLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto p-4 border-t">
                    <div className="flex flex-col gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild className="w-full justify-start">
                        <Link href="/login">Sign Up</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
