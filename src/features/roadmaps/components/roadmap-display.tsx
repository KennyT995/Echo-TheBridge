import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import type { Roadmap, RoadmapItem } from '@/lib/types';
import { CheckCircle2, CircleDot, GanttChartSquare, CalendarDays } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DocumentReference } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';


interface RoadmapDisplayProps {
  roadmap: Roadmap;
  roadmapRef: DocumentReference | null;
}

type RoadmapSectionKey = 'yearlyMilestones' | 'monthlySprints' | 'weeklyTactics' | 'dailyHabits';

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

export function RoadmapDisplay({ roadmap, roadmapRef }: RoadmapDisplayProps) {
  if (!roadmap) return null;

  const calculateProgress = (items: RoadmapItem[]) => {
    if (!items || items.length === 0) return 0;
    const completedCount = items.filter((item) => item.completed).length;
    return (completedCount / items.length) * 100;
  };

  const triggerCelebration = (sectionKey: RoadmapSectionKey) => {
    const configs: Record<RoadmapSectionKey, confetti.Options> = {
      dailyHabits: { particleCount: 30, spread: 50, origin: { y: 0.7 }, scalar: 0.8 },
      weeklyTactics: { particleCount: 60, spread: 70, origin: { y: 0.65 }, scalar: 1.0 },
      monthlySprints: { particleCount: 100, spread: 90, origin: { y: 0.6 }, scalar: 1.2 },
      yearlyMilestones: { particleCount: 200, spread: 120, origin: { y: 0.5 }, scalar: 1.4 },
    };

    const config = configs[sectionKey];
    confetti({
      ...config,
      disableForReducedMotion: true,
      colors: ['#22c55e', '#ec4899', '#3b82f6', '#eab308'], // Green, Pink, Blue, Yellow
    });
  };

  const handleCheckChange = async (section: RoadmapSectionKey, index: number, checked: boolean) => {
    if (!roadmapRef) return;

    const newRoadmapData = { ...roadmap };
    const newSection = [...newRoadmapData[section]];

    if (newSection[index]) {
      newSection[index] = { ...newSection[index], completed: checked };

      // Fire confetti if checking (not unchecking)
      if (checked) {
        triggerCelebration(section);
      }

      updateDocumentNonBlocking(roadmapRef, { [section]: newSection });
    }
  };

  return (
    <Card className="w-full border-2 border-border/50 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <Accordion type="multiple" defaultValue={['yearlyMilestones']} className="w-full space-y-6">
          {roadmapSections.map((section) => {
            const items = roadmap[section.key];
            if (!items || items.length === 0) return null;

            const progress = calculateProgress(items);

            return (
              <AccordionItem key={section.key} value={section.key} className="border-border/60 rounded-xl bg-card/40 overflow-hidden">
                <div className="flex flex-col">
                  <AccordionTrigger className="px-4 py-3 text-lg font-medium text-primary/90 hover:text-primary hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span>{section.title}</span>
                    </div>
                  </AccordionTrigger>

                  {/* Progress Bar always visible in header area */}
                  <div className="px-4 pb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        {Math.round(progress)}% Complete
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 w-full" />
                  </div>
                </div>

                <AccordionContent className="p-0">
                  <ul className="divide-y divide-border/50">
                    {items.map((item: RoadmapItem, index: number) => (
                      <li key={index} className="flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
                        <Checkbox
                          id={`${section.key}-${index}`}
                          checked={item.completed}
                          onCheckedChange={(checked) => handleCheckChange(section.key, index, !!checked)}
                          className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <label
                          htmlFor={`${section.key}-${index}`}
                          className={cn(
                            "text-sm sm:text-base text-foreground/90 cursor-pointer flex-1 leading-relaxed",
                            item.completed && "line-through text-muted-foreground opacity-70"
                          )}
                        >
                          {item.text}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
