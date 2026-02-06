import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Echo: The Bridge",
  description:
    "Common questions about Echo: The Bridge features, pricing, and AI technology.",
};

const faqs = [
  {
    question: "How does the AI Roadmap generation work?",
    answer:
      "Our AI analyzes your goal description using deep semantic understanding to break it down into logical steps. It references proven planning frameworks to structure these steps into yearly, monthly, weekly, and daily actions, ensuring a coherent path from vision to reality.",
  },
  {
    question: "Can I edit the roadmap after it's generated?",
    answer:
      "Yes! While the AI provides a solid foundation, you have full control. You can currently check off items as you complete them. Future updates will allow for direct editing and re-generating specific sections.",
  },
  {
    question: "Is my vision data private?",
    answer:
      "Absolutely. Your visions and roadmaps are stored securely in your private database. We do not use your personal vision data to train public AI models. Read our Privacy Policy for more details.",
  },
  {
    question: "What happens if I cancel my subscription?",
    answer:
      "If you cancel your paid subscription, you will be downgraded to the free 'Trailblazer' plan at the end of your billing cycle. You will retain access to your existing visions, but you may be unable to create new ones if you exceed the free plan's limits.",
  },
  {
    question: "Do you offer team or enterprise plans?",
    answer:
      "Currently, Echo: The Bridge is focused on individual personal development. However, we are exploring team features for shared organizational visions. Contact us if you're interested in being a beta tester for teams.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full -z-10" />

      <main className="flex-1 py-12 md:py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-24 animate-reveal">
            <div className="flex items-center justify-center gap-3 text-primary mb-6">
              <div className="h-px w-12 bg-primary/20" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]">Knowledge Repository</span>
              <div className="h-px w-12 bg-primary/20" />
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-8">
              System <span className="text-gradient">Intelligence</span>
            </h1>
            <p className="text-xl text-muted-foreground/60 leading-relaxed font-light max-w-2xl mx-auto">
              Decrypting the mechanics of the bridge. Everything you need to know about the matrix of manifestation.
            </p>
          </div>

          <div className="space-y-6 animate-reveal delay-200">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-none rounded-[2rem] glass-card px-8 overflow-hidden transition-all duration-500 hover:border-white/10"
                >
                  <AccordionTrigger className="py-8 text-left text-xl font-bold tracking-tight hover:no-underline hover:text-primary transition-colors data-[state=open]:text-primary group">
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-black text-muted-foreground/20 group-data-[state=open]:text-primary/40">{(index + 1).toString().padStart(2, '0')}</span>
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-8 pl-12 text-lg text-muted-foreground/60 font-light leading-relaxed border-t border-white/5 pt-6 italic">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="mt-24 p-12 rounded-[3rem] glass-card border-primary/10 text-center space-y-8 animate-reveal delay-500">
            <h3 className="text-3xl font-black font-headline tracking-tighter">Beyond the Archive?</h3>
            <p className="text-muted-foreground/60 max-w-lg mx-auto font-light">
              If your inquiry resides outside these parameters, initiate a direct link with our support architects.
            </p>
            <Button asChild className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-105 transition-all">
              <Link href="/contact">Establish Link</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
