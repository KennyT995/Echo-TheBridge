import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, Target, BrainCircuit, ArrowRight, Sparkles } from "lucide-react";
import placeholderData from "@/app/lib/placeholder-images.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Echo: The Bridge - Turn Long-Term Vision into Daily Action",
  description:
    "Stop dreaming, start doing. Echo: The Bridge translates your long-term goals into a dynamic, AI-powered action plan.",
};

const featureData = [
  {
    icon: Target,
    title: "Clarify Your North Star",
    description:
      "Pinpoint your ultimate goal. Our AI asks the right questions to help you define a clear, compelling vision for your future.",
    image: placeholderData.features[0].image,
    hint: placeholderData.features[0].hint,
  },
  {
    icon: Rocket,
    title: "Architect Your Inevitable Path",
    description:
      "Get your personalized action plan. The AI reverse-engineers your vision into concrete yearly milestones, monthly sprints, weekly tactics, and daily habits.",
    image: placeholderData.features[1].image,
    hint: placeholderData.features[1].hint,
  },
  {
    icon: BrainCircuit,
    title: "Execute with an AI Co-pilot",
    description:
      "Stay aligned and motivated. Your AI coach provides strategic insights, celebrates your progress, and helps you navigate any obstacle along the way.",
    image: placeholderData.features[2].image,
    hint: placeholderData.features[2].hint,
  },
];

const heroImage = {
  imageUrl: placeholderData.hero.imageUrl,
  imageHint: placeholderData.hero.imageHint,
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden px-4 py-20">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt="Visionary bridge background"
                fill
                sizes="100vw"
                priority
                className="object-cover opacity-30 scale-105 animate-subtle-zoom"
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Personal Architecture</span>
            </div>

            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary leading-[1.1]">
              Bridge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Vision</span> to Reality
            </h1>

            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
              Stop dreaming, start doing. Echo: The Bridge translates your
              long-term goals into a dynamic, AI-powered action plan.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold rounded-full group">
                <Link href="/login">
                  Get Started for Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold rounded-full border-2">
                <Link href="#features">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-6">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground">
                A simple, powerful three-step process to turn your aspirations into
                achievements.
              </p>
            </div>

            <div className="grid gap-16 lg:grid-cols-3">
              {featureData.map((feature, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative w-full aspect-video mb-8 rounded-2xl overflow-hidden shadow-xl border border-border/50">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Quote Section */}
        <section className="py-24 bg-primary text-primary-foreground text-center px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <blockquote className="text-3xl md:text-4xl font-headline font-bold italic leading-tight">
              &quot;The secret of your future is hidden in your daily routine.&quot;
            </blockquote>
            <cite className="text-xl opacity-80 not-italic">— Mike Murdock</cite>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="py-24 md:py-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-[2/1] bg-primary/5 blur-[120px] rounded-full -z-10" />
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">
              Find the Perfect Plan
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-xl text-muted-foreground mb-12">
              Whether you&apos;re just starting out or ready to build a lasting
              legacy, we have a plan for you.
            </p>
            <Button
              asChild
              size="lg"
              className="h-16 px-12 text-xl font-bold rounded-full shadow-2xl shadow-primary/20"
            >
              <Link href="/plans">View Plans & Pricing</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer-like simple credits */}
      <footer className="py-8 border-t border-border/50 text-center text-muted-foreground text-sm uppercase tracking-widest">
        &copy; {new Date().getFullYear()} ECHO: THE BRIDGE. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
