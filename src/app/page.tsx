import { VisionForm } from '@/components/vision-form';

export default function Home() {
  return (
    <main className="container mx-auto min-h-screen px-4 py-12 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary sm:text-5xl md:text-6xl">
          Vision Bridge
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          Define your future. We'll architect the path.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl">
        <VisionForm />
      </div>
    </main>
  );
}
