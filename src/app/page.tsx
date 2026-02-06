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
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-20">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt="Visionary bridge background"
                fill
                sizes="100vw"
                priority
                className="object-cover opacity-20 scale-105 animate-subtle-zoom"
                data-ai-hint={heroImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/40 to-background" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto text-center space-y-10 animate-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span className="uppercase">AI-Powered Personal Architecture</span>
            </div>

            <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] lg:leading-[0.85]">
              Bridge Your <span className="text-gradient">Vision</span> <br className="hidden md:block" /> to Reality
            </h1>

            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground/80 leading-relaxed font-light">
              Stop dreaming, start doing. <span className="text-foreground font-medium italic">Echo: The Bridge</span> translates your
              long-term goals into a dynamic, AI-powered action plan.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
              <Button asChild size="lg" className="h-16 px-10 text-xl font-bold rounded-full group shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                <Link href="/login">
                  Get Started for Free
                  <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 text-xl font-bold rounded-full border-2 glass hover:bg-white/5 transition-all duration-300">
                <Link href="#features">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 md:py-48 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-24 animate-reveal">
              <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tight mb-8">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                A simple, powerful three-step process to turn your aspirations into
                achievements.
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              {featureData.map((feature, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col items-center text-center p-10 rounded-[2.5rem] glass-card hover:bg-white/5 transition-all duration-500 hover:-translate-y-4"
                >
                  <div className="relative w-full aspect-[4/3] mb-10 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                      <div className="bg-primary p-3 rounded-2xl shadow-lg animate-float">
                        <feature.icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold mb-6 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-lg text-muted-foreground/90 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] -z-10" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[160px] -z-10" />
        </section>

        {/* Vision Quote Section */}
        <section className="py-32 md:py-48 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
          <div className="max-w-5xl mx-auto space-y-10 px-4 text-center relative z-10">
            <blockquote className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold italic leading-tight text-primary-foreground tracking-tighter animate-reveal">
              &quot;The secret of your future is hidden in your daily routine.&quot;
            </blockquote>
            <cite className="block text-2xl text-primary-foreground/70 not-italic font-medium uppercase tracking-[0.2em]">
              — Mike Murdock
            </cite>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="py-32 md:py-48 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl aspect-square bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse" />
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-5xl md:text-7xl font-bold mb-10 tracking-tight">
              Ready to Build Your <span className="text-gradient">Legacy</span>?
            </h2>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground mb-16 font-light">
              Whether you&apos;re just starting out or ready to bridge the gap to greatness, we have the architecture you need.
            </p>
            <Button
              asChild
              size="lg"
              className="h-20 px-16 text-2xl font-bold rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 animate-float"
            >
              <Link href="/plans">View Plans & Pricing</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

