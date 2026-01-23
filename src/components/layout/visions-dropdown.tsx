"use client";

import {
  useUser,
  useMemoFirebase,
  useCollection,
  useFirestore,
} from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Rocket, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vision } from "@/lib/types";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function VisionsDropdown() {
  const { user } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

  const visionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "users", user.uid, "visions"),
      orderBy("createdAt", "desc"),
    );
  }, [user, firestore]);

  const { data: visions, isLoading } = useCollection<Vision>(visionsQuery);

  if (isLoading) {
    return <Skeleton className="h-9 w-32" />;
  }

  if (!visions || visions.length === 0) {
    return null;
  }

  const currentVision = visions.find((v) => pathname === `/vision/${v.id}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Rocket className="w-4 h-4" />
          <span className="hidden lg:inline-block">
            {currentVision ? currentVision.title : "My Visions"}
          </span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {visions.map((vision) => (
          <DropdownMenuItem key={vision.id} asChild>
            <Link
              href={`/vision/${vision.id}`}
              className={cn(
                "w-full cursor-pointer",
                pathname === `/vision/${vision.id}` &&
                  "bg-accent text-accent-foreground",
              )}
            >
              {vision.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
