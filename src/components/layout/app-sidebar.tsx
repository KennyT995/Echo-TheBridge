"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Vision } from "@/lib/types";
import { FirestorePaths } from "@/lib/firestore-paths";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, LogOut, User as UserIcon, Rocket } from "lucide-react";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { sidebarInfoLinks, sidebarDashboardLinks } from "@/lib/navigation";

interface AppSidebarProps {
  onLinkClick?: () => void;
}

export default function AppSidebar({ onLinkClick }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    if (onLinkClick) onLinkClick();
    await auth.signOut();
    router.push("/login");
  };

  const firestore = useFirestore();
  const visionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, FirestorePaths.visions(user.uid)),
      orderBy("createdAt", "desc"),
    );
  }, [user, firestore]);

  const { data: visions, isLoading: visionsLoading } =
    useCollection<Vision>(visionsQuery);

  return (
    <div className="flex h-full flex-col bg-[#050505] text-sidebar-foreground border-r border-white/5">
      <div className="flex-1 p-6 overflow-y-auto space-y-8">
        <nav className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-2 px-4">Knowledge Base</span>
          {sidebarInfoLinks.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className="justify-start gap-4 h-12 rounded-xl text-muted-foreground/60 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Link href={item.href} onClick={onLinkClick}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-all block" />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <nav className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-2 px-4">Directives</span>
          {sidebarDashboardLinks.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "justify-start gap-4 h-12 rounded-xl transition-all group",
                pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Link href={item.href} onClick={onLinkClick}>
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", pathname === item.href ? "text-primary" : "text-muted-foreground/40")} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-4">Strategic Visions</span>
          {visionsLoading && (
            <div className="space-y-3 px-4">
              <Skeleton className="h-10 w-full rounded-xl bg-white/5" />
              <Skeleton className="h-10 w-full rounded-xl bg-white/5" />
            </div>
          )}
          {!visionsLoading && visions && visions.length > 0 && (
            <Accordion
              type="single"
              collapsible
              className="w-full px-2"
              defaultValue="my-visions"
            >
              <AccordionItem value="my-visions" className="border-none">
                <AccordionTrigger className="px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 rounded-xl hover:no-underline transition-all group">
                  <div className="flex items-center gap-3">
                    <Rocket className="w-4 h-4 group-hover:animate-bounce" />
                    <span>Active Manifests</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pt-4 pb-2">
                    {visions.map((vision) => (
                      <li key={vision.id}>
                        <Link
                          href={`/vision/${vision.id}`}
                          onClick={onLinkClick}
                          className={cn(
                            "flex items-center gap-3 text-sm rounded-xl p-4 transition-all group/item",
                            pathname === `/vision/${vision.id}`
                              ? "bg-white/5 text-primary border border-white/10"
                              : "text-muted-foreground/60 hover:text-white hover:bg-white/5 border border-transparent"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-6 rounded-full transition-all block",
                            pathname === `/vision/${vision.id}` ? "bg-primary" : "bg-white/10 group-hover/item:bg-primary/40"
                          )} />
                          <span className="truncate font-medium">{vision.title}</span>
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

      <div className="p-6 border-t border-white/5 bg-[#050505]/50">
        {user && (
          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 gap-4 h-16 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <Avatar className="h-10 w-10 border border-white/10 group-hover:border-primary/40 transition-colors">
                    <AvatarImage
                      src={user.photoURL || ""}
                      alt={user.displayName || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(
                        user.displayName?.[0] ||
                        user.email?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-bold tracking-tight text-white truncate w-full text-left">
                      {user.displayName || "Visionary"}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-black truncate w-full text-left">
                      {user.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 glass-card border-white/10 p-2 rounded-2xl shadow-2xl" align="end" forceMount>
                <DropdownMenuLabel className="p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold tracking-tight text-white leading-none">
                      {user.displayName || "Visionary"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-black truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuGroup className="p-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="flex items-center px-4 py-3 rounded-xl focus:bg-primary/10 transition-colors cursor-pointer group"
                      onClick={onLinkClick}
                    >
                      <UserIcon className="mr-3 h-5 w-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      <span className="font-bold text-sm tracking-tight text-muted-foreground/80 group-hover:text-white transition-colors">Identity Matrix</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/plans"
                      className="flex items-center px-4 py-3 rounded-xl focus:bg-primary/10 transition-colors cursor-pointer group"
                      onClick={onLinkClick}
                    >
                      <CreditCard className="mr-3 h-5 w-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      <span className="font-bold text-sm tracking-tight text-muted-foreground/80 group-hover:text-white transition-colors">Sector Allocation</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center px-4 py-3 rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors cursor-pointer group"
                  >
                    <LogOut className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    <span className="font-bold text-sm tracking-tight">Terminate Session</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
