import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Echo: The Bridge",
  description:
    "How Echo: The Bridge collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <main className="flex-1 py-12 md:py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex items-center gap-3 text-primary mb-6 animate-reveal">
            <div className="h-px w-12 bg-primary/20" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Privacy Directive</span>
          </div>
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-12 animate-reveal">
            Data <span className="text-gradient">Integrity</span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 animate-reveal delay-200">
            <div className="lg:col-span-1 space-y-8">
              <div className="p-8 rounded-[2.5rem] glass-card border-white/5 bg-primary/5 space-y-4">
                <p className="text-lg text-white font-bold tracking-tight leading-relaxed italic">
                  &quot;Trust is the primary component of any stable architecture.&quot;
                </p>
                <p className="text-muted-foreground/60 text-sm font-light leading-relaxed">
                  At Echo: The Bridge, we operate on a hierarchy of absolute transparency. Your data is your catalyst, and we treat it as such.
                </p>
              </div>

              <div className="space-y-4 px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Core Principles</h3>
                <ul className="space-y-6">
                  <li className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">Minimal collection: Only the parameters required for trajectory calibration.</p>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p className="text-sm text-muted-foreground/80 font-light leading-relaxed">Absolute silos: Your visions are indexed specifically to your identity signature.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-16">
              <div className="prose prose-invert max-w-none prose-h2:font-headline prose-h2:text-3xl prose-h2:font-black prose-h2:tracking-tighter prose-h2:text-white prose-p:text-muted-foreground/60 prose-p:leading-relaxed prose-p:font-light prose-strong:text-white prose-strong:font-bold">
                <section>
                  <h2>1. Parameter Acquisition</h2>
                  <p>
                    **Diagnostic Data:** We monitor system health through non-identifying telemetry—browser archetypes, temporal requests, and routing pathways. This is essential for maintaining bridge stability.
                  </p>
                  <p>
                    **Identity Markers:** Initial access require an email signature. Your visions are stored as encrypted nodes within your personal sector of the matrix.
                  </p>
                </section>

                <section>
                  <h2>2. Catalyst Utilization</h2>
                  <p>
                    We utilize your provided intent to calibrate the AI response engines. This ensures that every generated trajectory is specifically tuned to your personal frequency. We do not aggregate this data for public model training.
                  </p>
                </section>

                <section>
                  <h2>3. Neural Processing Protocols</h2>
                  <p>
                    Your objectives are processed through our primary neural partners (Vertex AI/Gemini). These transmissions are secured through enterprise-grade tunneling. Under our enterprise agreement, this data is never utilized for latent model refinement.
                  </p>
                </section>
              </div>

              <div className="pt-12 border-t border-white/5 flex items-center justify-between gap-8">
                <p className="text-xs text-muted-foreground/20 font-light italic">
                  Last recalibrated: February 05, 2026
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Secure Connection: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
