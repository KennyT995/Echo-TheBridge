"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, LayoutDashboard, LogOut, User } from "lucide-react";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await auth.signOut();
    router.push("/login");
  };

  if (isUserLoading || !user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-11 w-11 rounded-xl glass border-white/10 hover:bg-white/5 p-0 transition-all active:scale-95 group">
          <Avatar className="h-9 w-9 border border-white/10 group-hover:border-primary/40 transition-colors">
            <AvatarImage
              src={user.photoURL || ""}
              alt={user.displayName || "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
            <Link href="/dashboard" className="flex items-center px-4 py-3 rounded-xl focus:bg-primary/10 transition-colors cursor-pointer group">
              <LayoutDashboard className="mr-3 h-5 w-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-tight text-muted-foreground/80 group-hover:text-white transition-colors">Command Center</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account" className="flex items-center px-4 py-3 rounded-xl focus:bg-primary/10 transition-colors cursor-pointer group">
              <User className="mr-3 h-5 w-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-tight text-muted-foreground/80 group-hover:text-white transition-colors">Identity Matrix</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/plans" className="flex items-center px-4 py-3 rounded-xl focus:bg-primary/10 transition-colors cursor-pointer group">
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
  );
}
