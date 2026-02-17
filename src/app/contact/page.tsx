"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Link Established",
        description: "Your transmission has been received by the support architects.",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <main className="flex-1 py-12 md:py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-24 animate-reveal">
            <div className="flex items-center justify-center gap-3 text-primary mb-6">
              <div className="h-px w-12 bg-primary/20" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Establish Link</span>
              <div className="h-px w-12 bg-primary/20" />
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-8">
              Direct <span className="text-gradient">Transmission</span>
            </h1>
            <p className="text-xl text-muted-foreground/60 leading-relaxed max-w-2xl mx-auto font-light">
              Have inquiries about your trajectory? Want to partner with the architects? Initiate a secure link.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto animate-reveal delay-200">
            <div className="md:col-span-1 space-y-8">
              <div className="p-8 rounded-[2.5rem] glass-card border-white/5 space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Neural Anchors</h3>

                <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white uppercase tracking-widest mb-1">Email</h4>
                      <p className="text-muted-foreground/40 font-light italic">
                        protocols@echo-the-bridge.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white uppercase tracking-widest mb-1">Comms</h4>
                      <p className="text-muted-foreground/40 font-light italic">
                        +1 (555) ARCHITECT
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white uppercase tracking-widest mb-1">Nexus</h4>
                      <p className="text-muted-foreground/40 font-light italic">
                        Level 42, The Spire<br />
                        Neo San Francisco, CA
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-primary group hover:scale-[1.02] transition-all cursor-pointer">
                <h4 className="font-black text-black uppercase tracking-tighter text-3xl mb-2">Priority Path?</h4>
                <p className="text-black/60 text-sm font-bold uppercase tracking-widest">Upgrade for Instant Calibration</p>
              </div>
            </div>

            <div className="md:col-span-2 p-10 rounded-[3rem] glass-card border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -z-10" />

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">Identifier: First</label>
                    <Input
                      placeholder="e.g. Neo"
                      required
                      className="h-16 rounded-[1.5rem] glass border-white/10 px-6 font-light italic focus-visible:ring-primary/40 bg-white/5"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">Identifier: Last</label>
                    <Input
                      placeholder="e.g. Anderson"
                      required
                      className="h-16 rounded-[1.5rem] glass border-white/10 px-6 font-light italic focus-visible:ring-primary/40 bg-white/5"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">Comms Channel</label>
                  <Input
                    type="email"
                    placeholder="matrix@bridge.ai"
                    required
                    className="h-16 rounded-[1.5rem] glass border-white/10 px-6 font-light italic focus-visible:ring-primary/40 bg-white/5"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4">The Transmission</label>
                  <Textarea
                    placeholder="Describe your inquiry or desired trajectory alignment..."
                    className="min-h-[200px] rounded-[2rem] glass border-white/10 p-8 font-light italic focus-visible:ring-primary/40 bg-white/5"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 rounded-[1.5rem] bg-primary text-black font-black uppercase tracking-[0.2em] text-lg hover:scale-[1.02] transition-all shadow-2xl shadow-primary/20"
                >
                  {isSubmitting ? "Syncing Logic..." : "Establish Secure Link"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
