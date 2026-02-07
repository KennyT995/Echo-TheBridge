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
import { ModeToggle } from "./mode-toggle";

export default function HeaderClient() {
  const { user, isUserLoading } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/40 transition-all duration-500">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="group flex items-center gap-4 transition-all hover:scale-[1.02]">
            <div className="relative w-10 h-10 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] group-hover:border-primary/40">
              <Image
                src="/logo.png"
                alt="Echo: The Bridge Logo"
                width={24}
                height={24}
                className="object-contain relative z-10"
              />
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-headline text-xl font-black tracking-tighter text-white sm:inline-block hidden">
              Echo<span className="text-primary">:</span>The Bridge
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {mainNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-primary transition-all duration-300 relative group/link"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover/link:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4">
            <InstallPrompt />
            <ModeToggle />
            {isUserLoading ? (
              <div className="h-10 w-10 rounded-full animate-pulse bg-white/5 border border-white/10" />
            ) : user ? (
              <UserNav />
            ) : (
              <Button asChild className="h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Link href="/login">Initialize Access</Link>
              </Button>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <ModeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-xl glass border-white/10 hover:bg-white/5"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[350px] p-0 border-r-white/5 bg-[#050505]/95 backdrop-blur-2xl">
                <SheetHeader className="p-8 border-b border-white/5">
                  <SheetTitle className="text-2xl font-headline font-black tracking-tighter text-white">
                    Architect <span className="text-primary">Menu</span>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu for accessing pages and user account.
                  </SheetDescription>
                </SheetHeader>
                {user ? (
                  <AppSidebar onLinkClick={() => setOpen(false)} />
                ) : (
                  <div className="flex flex-col h-full bg-[#050505]/50">
                    <nav className="flex flex-col gap-2 p-8">
                      {mainNavLinks.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center px-6 py-4 text-sm font-bold uppercase tracking-widest rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto p-8 border-t border-white/5 space-y-4">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full h-14 rounded-2xl glass border-white/10 font-bold"
                      >
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold">
                        <Link href="/login">Initialize Access</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
