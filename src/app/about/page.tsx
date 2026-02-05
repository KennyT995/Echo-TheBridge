import type { Metadata } from "next";
import NextImage from "next/image";
import placeholderData from "@/app/lib/placeholder-images.json";

interface TeamMember {
  name: string;
  role: string;
  img: string;
}

export const metadata: Metadata = {
  title: "About Us | Echo: The Bridge",
  description:
    "Learn about Echo: The Bridge and our mission to help you turn your long-term vision into daily action.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">
        About Echo: The Bridge
      </h1>
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p>
          Echo: The Bridge is designed to solve a fundamental problem: the gap
          between long-term ambition and daily execution. We believe that
          everyone has a vision for their future self, but the path to get there
          is often obscured by the noise of daily life.
        </p>
        <p>
          Our platform acts as the bridge. By using advanced AI to
          reverse-engineer your 10-year vision into yearly milestones, monthly
          sprints, weekly tactics, and daily habits, we ensure that every action
          you take is a step towards your ultimate goal.
        </p>
        <h2>Our Philosophy</h2>
        <p>
          We believe in &quot;actionable dreaming.&quot; A vision without a plan
          is just a dream. A plan without a vision is drudgery. But a vision
          with a plan can change your life.
        </p>
      </div>

      <div className="mt-24">
        <h2 className="font-headline text-3xl font-bold mb-12 text-center">
          The Architects Behind the Bridge
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(placeholderData.about.members as TeamMember[]).map((member) => (
            <div
              key={member.name}
              className="group relative overflow-hidden rounded-3xl bg-secondary/20 border border-border/50 p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-secondary/30"
            >
              <div className="relative aspect-square mb-6 overflow-hidden rounded-2xl border border-border/50">
                <NextImage
                  src={member.img}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-primary font-medium text-sm mb-4">
                {member.role}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Expert in their field, dedicated to building the future of
                personal productivity and AI coaching.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

