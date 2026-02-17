import type { Metadata } from "next";
import NextImage from "next/image";
import { Rocket } from "lucide-react";
import placeholderData from "@/lib/placeholder-images.json";

interface TeamMember {
  name: string;
  role: string;
  img: string;
}

export const metadata: Metadata = {
  title: "About Us | Echo: The Bridge",
  description:
    "Learn about Echo: The Bridge and our mission to help you turn your long-term vision into daily action. Engineered for the human optimization cycle.",
  openGraph: {
    title: "About Us | Echo: The Bridge",
    description: "Engineered to solve the Execution Gap. Sync your Current Self with your Architected Self.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Echo: The Bridge",
    description: "Bridge the gap between vision and reality.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <main className="container mx-auto px-6 py-12 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto mb-24 animate-reveal">
          <div className="flex items-center gap-3 text-primary mb-6">
            <div className="h-px w-12 bg-primary/20" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Corporate Directive</span>
          </div>
          <h1 className="font-headline text-6xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] mb-12">
            The Architect <br /> <span className="text-gradient">Philosophy</span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            <div className="space-y-6">
              <p className="text-2xl text-white font-light leading-relaxed">
                Echo: The Bridge was engineered to solve a singular, fundamental failure in the human optimization cycle: <span className="text-primary font-bold">The Execution Gap.</span>
              </p>
              <p className="text-lg text-muted-foreground/60 leading-relaxed font-light">
                We believe that everyone exists within a dual state: the Current Self and the Architected Self. The noise of modern entropy often prevents the synchronization between these two states.
              </p>
            </div>
            <div className="space-y-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] glass-card backdrop-blur-3xl">
              <p className="text-lg text-muted-foreground/80 leading-relaxed font-light italic">
                &quot;Our platform serves as the bridge. By utilizing neural-link logic to reverse-engineer 10-year trajectories into atomic daily habits, we ensure every pulse of action is aligned with the Masterplan.&quot;
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-primary">System Integrity: 100%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 animate-reveal delay-200">
          <div className="p-10 rounded-[3rem] glass-card border-white/5 space-y-6 group hover:border-primary/20 transition-all">
            <h3 className="text-3xl font-black font-headline tracking-tighter">Wild Dreams</h3>
            <p className="text-muted-foreground/60 font-light leading-relaxed">Ambition without a structure is merely hallucination. We provide the scaffolding for your highest potential.</p>
          </div>
          <div className="p-10 rounded-[3rem] glass-card border-white/5 space-y-6 group hover:border-primary/20 transition-all bg-primary/5">
            <h3 className="text-3xl font-black font-headline tracking-tighter text-primary">The Bridge</h3>
            <p className="text-muted-foreground/60 font-light leading-relaxed">A direct neural connection between where you are and where you are destined to be, maintained through consistent daily pulses.</p>
          </div>
          <div className="p-10 rounded-[3rem] glass-card border-white/5 space-y-6 group hover:border-primary/20 transition-all">
            <h3 className="text-3xl font-black font-headline tracking-tighter">Inevitable Reality</h3>
            <p className="text-muted-foreground/60 font-light leading-relaxed">When action is mathematically aligned with vision, the outcome shifts from &quot;possible&quot; to &quot;logically certain.&quot;</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto animate-reveal delay-500">
          <div className="flex items-center justify-center gap-3 text-primary mb-16">
            <div className="h-px w-12 bg-primary/20" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">The Architects</span>
            <div className="h-px w-12 bg-primary/20" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {(placeholderData.about.members as TeamMember[]).map((member) => (
              <div
                key={member.name}
                className="group relative overflow-hidden rounded-[3rem] bg-white/[0.02] border border-white/5 p-8 transition-all duration-700 hover:-translate-y-4 hover:bg-white/[0.05] hover:border-primary/20"
              >
                <div className="relative aspect-[4/5] mb-8 overflow-hidden rounded-[2.5rem] border border-white/5">
                  <NextImage
                    src={member.img}
                    alt={member.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                </div>
                <h3 className="text-3xl font-black font-headline tracking-tighter mb-2">{member.name}</h3>
                <p className="text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-6">
                  {member.role}
                </p>
                <p className="text-base text-muted-foreground/40 leading-relaxed font-light italic">
                  Dedicated to engineering the neural infrastructure of individual transcendence.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

