import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { Rocket, Target, BrainCircuit, CheckCircle } from 'lucide-react';

const featureData = [
  {
    icon: Target,
    title: 'Define Your Vision',
    description: 'Structure your long-term aspirations across different life categories and time horizons, from 2 to 10 years.',
    image: 'https://picsum.photos/seed/feature-1/600/400',
    hint: 'planning future'
  },
  {
    icon: Rocket,
    title: 'Generate Your Roadmap',
    description: 'Our AI reverse-engineers your vision into a concrete, actionable plan with yearly, monthly, weekly, and daily goals.',
    image: 'https://picsum.photos/seed/feature-2/600/400',
    hint: 'path map'
  },
  {
    icon: BrainCircuit,
    title: 'Stay on Track with AI Coach',
    description: "Check in with your AI coach to analyze progress, celebrate wins, and get strategic advice to overcome obstacles.",
    image: 'https://picsum.photos/seed/feature-3/600/400',
    hint: 'guidance help'
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center px-4">
            <Image
                src="https://picsum.photos/seed/vision-hero/1200/800"
                alt="Abstract background"
                fill
                priority
                className="object-cover z-0 opacity-20"
                data-ai-hint="abstract dark"
            />
            <div className="z-10">
                <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-primary">
                    Bridge Your Vision to Reality
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                    Stop dreaming, start doing. Vision Bridge translates your long-term goals into a dynamic, AI-powered action plan.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button asChild size="lg" className="font-bold">
                        <Link href="/login">Get Started for Free</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                A simple, powerful process to turn your aspirations into achievements.
              </p>
            </div>
            <div className="mt-16 grid gap-12 md:grid-cols-3">
              {featureData.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border-2 border-primary text-primary mb-6">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="font-headline text-3xl md:text-4xl font-bold">
                    Find the Perfect Plan
                </h2>
                <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                    Whether you're just starting out or ready to build a lasting legacy, we have a plan for you.
                </p>
                <Button asChild size="lg" className="mt-8 font-bold" variant="outline">
                    <Link href="/plans">View Plans</Link>
                </Button>
            </div>
        </section>
      </main>

       {/* Footer */}
      <footer className="py-6 border-t border-border/50">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Vision Bridge. All rights reserved.</p>
            <nav className="flex gap-4">
                <Link href="/login" className="hover:text-primary">Login</Link>
                <Link href="/plans" className="hover:text-primary">Plans</Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}
