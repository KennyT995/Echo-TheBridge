"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, RotateCcw, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="font-headline text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                We encountered an unexpected error while processing your request. Our team has been notified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => reset()} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button asChild variant="outline" className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
            {process.env.NODE_ENV === "development" && (
                <pre className="mt-8 p-4 bg-muted rounded-lg text-left text-xs overflow-auto max-w-full">
                    {error.message}
                </pre>
            )}
        </div>
    );
}
