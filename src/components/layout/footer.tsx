"use client";

import Link from "next/link";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { footerContent } from "@/lib/navigation";
import { useEffect, useState } from "react";

export default function Footer() {


  return (
    <footer className="relative bg-[#050505] pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Background Ambience */}
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-1 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center transition-all group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                <Rocket className="h-6 w-6 text-primary" suppressHydrationWarning />
              </div>
              <span className="font-headline text-2xl font-black tracking-tighter text-white">
                Echo<span className="text-primary">:</span>The Bridge
              </span>
            </Link>
            <p className="text-lg text-muted-foreground/60 leading-relaxed font-light italic border-l-2 border-primary/20 pl-6 py-2">
              &quot;The most reliable way to predict the future is to architect it.&quot;
            </p>
            <div className="flex gap-4">
              {footerContent.socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="w-12 h-12 rounded-2xl glass border-white/5 flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:border-primary/20 transition-all hover:scale-110 active:scale-90"
                >
                  <item.icon className="h-5 w-5" suppressHydrationWarning />
                  <span className="sr-only">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 lg:col-span-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Platform</h3>
              <ul className="space-y-4">
                {footerContent.platformLinks.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-lg text-muted-foreground/40 hover:text-white transition-all font-light"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Directives</h3>
              <ul className="space-y-4">
                {footerContent.companyLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-lg text-muted-foreground/40 hover:text-white transition-all font-light"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Transmission</h3>
              <p className="text-base text-muted-foreground/40 font-light leading-relaxed">
                Subscribe to receive neural calibration updates and strategic insights.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="communications@matrix.com"
                className="h-14 rounded-2xl glass border-white/10 px-6 font-light italic focus-visible:ring-primary/40 bg-white/5"
              />
              <Button className="h-14 rounded-2xl bg-white text-black font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl group">
                Initialize Subscription
                <Rocket className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" suppressHydrationWarning />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-8 border-t border-white/5">
          <p className="text-sm font-light text-muted-foreground/30">
            <span suppressHydrationWarning>&copy; {new Date().getFullYear()}</span> Echo: The Bridge. All systems operational. v2.0.4-beta
          </p>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground/30 hover:text-primary transition-colors uppercase tracking-[0.2em] font-bold"
            >
              Privacy Protocol
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground/30 hover:text-primary transition-colors uppercase tracking-[0.2em] font-bold"
            >
              Usage Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
