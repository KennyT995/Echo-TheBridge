import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
        <Image
          src="/logo.png"
          alt="Echo Logo"
          width={80}
          height={80}
          className="relative animate-bounce-slow"
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          Building the Bridge
        </p>
        <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/3 animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}

