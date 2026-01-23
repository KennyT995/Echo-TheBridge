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
      collection(firestore, "users", user.uid, "visions"),
      orderBy("createdAt", "desc"),
    );
  }, [user, firestore]);

  const { data: visions, isLoading: visionsLoading } =
    useCollection<Vision>(visionsQuery);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="flex flex-col gap-2">
          {sidebarInfoLinks.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className="justify-start gap-2"
            >
              <Link href={item.href} onClick={onLinkClick}>
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="my-4 border-t border-sidebar-border/50" />

        <nav className="flex flex-col gap-2">
          {sidebarDashboardLinks.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="justify-start gap-2"
            >
              <Link href={item.href} onClick={onLinkClick}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>

        <div className="mt-4">
          {visionsLoading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {!visionsLoading && visions && visions.length > 0 && (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="my-visions"
            >
              <AccordionItem value="my-visions" className="border-none">
                <AccordionTrigger className="px-2 py-2 text-sm font-medium hover:bg-muted rounded-md hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    <span>My Visions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 pl-4 pr-2 py-2">
                    {visions.map((vision) => (
                      <li key={vision.id}>
                        <Link
                          href={`/vision/${vision.id}`}
                          onClick={onLinkClick}
                          className={cn(
                            "block text-sm rounded-md p-2 hover:bg-muted",
                            pathname === `/vision/${vision.id}`
                              ? "bg-muted font-semibold"
                              : "",
                          )}
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

      <div className="p-4 border-t border-sidebar-border">
        {user && (
          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 gap-2 h-auto py-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL || ""}
                      alt={user.displayName || "User"}
                    />
                    <AvatarFallback>
                      {(
                        user.displayName?.[0] ||
                        user.email?.[0] ||
                        "U"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-medium truncate w-full text-left">
                      {user.displayName || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full text-left">
                      {user.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="w-full cursor-pointer"
                      onClick={onLinkClick}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/plans"
                      className="w-full cursor-pointer"
                      onClick={onLinkClick}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Plans</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
