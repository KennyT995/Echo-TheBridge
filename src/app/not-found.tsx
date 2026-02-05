import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <Compass className="h-24 w-24 text-primary relative animate-bounce-slow" />
            </div>
            <h1 className="font-headline text-5xl font-bold mb-4 tracking-tight">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Lost in the Fog?</h2>
            <p className="text-muted-foreground max-w-md mb-10 text-lg">
                The bridge you&apos;re looking for doesn&apos;t seem to lead anywhere.
                Let&apos;s get you back on the right path to your vision.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gap-2 shadow-lg shadow-primary/20">
                <Link href="/">
                    <Home className="h-5 w-5" />
                    Back to Safety
                </Link>
            </Button>
        </div>
    );
}
