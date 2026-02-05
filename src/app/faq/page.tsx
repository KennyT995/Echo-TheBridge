import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

      <main className="flex-1 py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Common <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Inquiries</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Everything you need to know about navigating the bridge from vision to reality.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
}
