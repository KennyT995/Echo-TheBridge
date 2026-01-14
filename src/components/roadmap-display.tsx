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
import { DocumentReference, updateDoc } from 'firebase/firestore';

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

  const handleCheckChange = async (section: RoadmapSectionKey, index: number, checked: boolean) => {
    if (!roadmapRef) return;

    // Create a deep copy of the roadmap to avoid direct mutation
    const newRoadmapData = { ...roadmap };
    const newSection = [...newRoadmapData[section]];
    
    // Ensure the item exists before trying to update it
    if(newSection[index]) {
      newSection[index] = { ...newSection[index], completed: checked };
      
      // Use dot notation to update only the specific section array in Firestore
      await updateDoc(roadmapRef, {
        [section]: newSection
      }).catch(error => {
        // In a real app, you might want to show a toast notification on error
        console.error("Failed to update roadmap item:", error);
      });
    }
  };

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
                    {roadmap[section.key].map((item: RoadmapItem, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Checkbox
                          id={`${section.key}-${index}`}
                          checked={item.completed}
                          onCheckedChange={(checked) => handleCheckChange(section.key, index, !!checked)}
                          className="mt-1"
                        />
                        <label
                            htmlFor={`${section.key}-${index}`}
                            className={cn(
                                "text-foreground/90 cursor-pointer",
                                item.completed && "line-through text-muted-foreground"
                            )}
                        >
                            {item.text}
                        </label>
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
