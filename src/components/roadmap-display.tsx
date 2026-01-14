import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import type { Roadmap } from '@/lib/types';
import { CheckCircle2, CircleDot, GanttChartSquare, CalendarDays } from 'lucide-react';

interface RoadmapDisplayProps {
  roadmap: Roadmap;
}

const roadmapSections = [
  {
    title: 'Yearly Milestones',
    key: 'yearlyMilestones',
    icon: GanttChartSquare,
  },
  {
    title: 'Monthly Sprints',
    key: 'monthlySprints',
    icon: CalendarDays,
  },
  {
    title: 'Weekly Tactics',
    key: 'weeklyTactics',
    icon: CircleDot,
  },
  {
    title: 'Daily Habits',
    key: 'dailyHabits',
    icon: CheckCircle2,
  },
] as const;

export function RoadmapDisplay({ roadmap }: RoadmapDisplayProps) {
  if (!roadmap) return null;

  return (
    <Card className="w-full bg-card/80 backdrop-blur-lg border-white/10">
      <CardContent className="p-4 sm:p-6">
        <Accordion type="multiple" defaultValue={['yearlyMilestones']} className="w-full space-y-4">
          {roadmapSections.map((section) => (
            roadmap[section.key] && roadmap[section.key].length > 0 && (
              <AccordionItem key={section.key} value={section.key} className="border-border/50 rounded-lg bg-secondary/30">
                <AccordionTrigger className="p-4 text-lg font-medium text-primary/90 hover:text-primary hover:no-underline">
                  <div className="flex items-center gap-3">
                    <section.icon className="h-5 w-5 text-accent" />
                    <span>{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <ul className="space-y-3 pt-2 pl-4">
                    {roadmap[section.key].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 mt-1 shrink-0 text-primary" />
                        <span className="text-foreground/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
