import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, Target, BrainCircuit } from 'lucide-react';
import placeholderData from '@/app/lib/placeholder-images.json';

const featureData = [
  {
    icon: Target,
    title: 'Define Your Vision',
    description: 'Structure your long-term aspirations across different life categories and time horizons, from 2 to 10 years.',
    image: placeholderData.features[0].image,
    hint: placeholderData.features[0].hint
  },
  {
    icon: Rocket,
    title: 'Generate Your Roadmap',
    description: 'Our AI reverse-engineers your vision into a concrete, actionable plan with yearly, monthly, weekly, and daily goals.',
    image: placeholderData.features[1].image,
    hint: placeholderData.features[1].hint
  },
  {
    icon: BrainCircuit,
    title: 'Stay on Track with AI Coach',
    description: "Check in with your AI coach to analyze progress, celebrate wins, and get strategic advice to overcome obstacles.",
    image: placeholderData.features[2].image,
    hint: placeholderData.features[2].hint
  },
];

const heroImage = { imageUrl: placeholderData.hero.imageUrl, imageHint: placeholderData.hero.imageHint };

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center px-4">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt="Abstract background"
              fill
              sizes="100vw"
              priority
              className="object-cover z-0 opacity-20"
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="z-10">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-primary">
              Bridge Your Vision to Reality
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Stop dreaming, start doing. Echo: The Bridge translates your long-term goals into a dynamic, AI-powered action plan.
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
    </div>
  );
}
