import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import type { Roadmap, RoadmapItem, RoadmapSectionKey } from '@/lib/types';
import { CheckCircle2, CircleDot, GanttChartSquare, CalendarDays, Pencil, RefreshCw, Flag, Timer } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { DocumentReference } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import confetti from 'canvas-confetti';
import { triggerMilestoneCelebration } from '@/lib/celebrations';
import { useToast } from '@/hooks/use-toast';
import { History } from 'lucide-react';
import { FocusTimer } from '@/features/dashboard/components/focus-timer';

interface RoadmapDisplayProps {
  roadmap: Roadmap;
  roadmapRef: DocumentReference | null;
  onRegenerateSection: (section: RoadmapSectionKey) => void;
}

const roadmapSections = [
  {
    title: 'Vision Timeline',
    key: 'visionTimeline',
    icon: Flag,
  },
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

export function RoadmapDisplay({ roadmap, roadmapRef, onRegenerateSection }: RoadmapDisplayProps) {
  const [editing, setEditing] = useState<{ section: RoadmapSectionKey; index: number; text: string } | null>(null);

  const { toast } = useToast();

  if (!roadmap) return null;

  const calculateProgress = (items: RoadmapItem[]) => {
    if (!items || items.length === 0) return 0;
    const completedCount = items.filter((item) => item.completed).length;
    return (completedCount / items.length) * 100;
  };

  const triggerCelebration = (sectionKey: RoadmapSectionKey) => {
    const baseLine = {
      dailyHabits: { count: 30, spread: 40, scalar: 0.8 },
      weeklyTactics: { count: 60, spread: 60, scalar: 1.0 },
      monthlySprints: { count: 100, spread: 80, scalar: 1.2 },
      yearlyMilestones: { count: 150, spread: 100, scalar: 1.4 },
      visionTimeline: { count: 180, spread: 120, scalar: 1.5 },
    }[sectionKey];

    // Randomize the parameters slightly to feel organic
    const randomSpread = baseLine.spread + (Math.random() * 20 - 10);
    const randomCount = Math.floor(baseLine.count * (0.8 + Math.random() * 0.4)); // +/- 20%
    const randomOriginX = 0.5 + (Math.random() * 0.2 - 0.1); // Center +/- 0.1

    confetti({
      particleCount: randomCount,
      spread: randomSpread,
      origin: { y: 0.6, x: randomOriginX },
      scalar: baseLine.scalar,
      disableForReducedMotion: true,
      colors: ['#22c55e', '#ec4899', '#3b82f6', '#eab308'],
      startVelocity: 30 + Math.random() * 20,
      gravity: 0.8,
      drift: Math.random() - 0.5,
      ticks: 300,
    });
  };

  const handleCheckChange = (section: RoadmapSectionKey, index: number, checked: boolean) => {
    if (!roadmapRef) return;

    const newRoadmapData = { ...roadmap };
    const newSection = [...newRoadmapData[section]];

    if (newSection[index]) {
      newSection[index] = { ...newSection[index], completed: checked };

      if (checked) {
        // Temporarily update the full roadmap to check overall status
        const tempFullRoadmap = { ...roadmap, [section]: newSection };

        const allItems = [
          ...(tempFullRoadmap.yearlyMilestones || []),
          ...(tempFullRoadmap.monthlySprints || []),
          ...(tempFullRoadmap.weeklyTactics || []),
          ...(tempFullRoadmap.dailyHabits || []),
        ];
        const isVisionComplete = allItems.every(item => item.completed);

        if (isVisionComplete) {
          triggerMilestoneCelebration('vision', toast);
        } else {
          const isSectionComplete = newSection.every((item) => item.completed);
          const wasSectionComplete = roadmap[section].every((item) => item.completed);

          if (isSectionComplete && !wasSectionComplete) {
            triggerMilestoneCelebration(section, toast);
          } else {
            triggerCelebration(section);
          }
        }
      }

      updateDocumentNonBlocking(roadmapRef, { [section]: newSection });
    }
  };

  const handleSaveEdit = () => {
    if (!roadmapRef || !editing) return;

    const { section, index, text } = editing;
    const newRoadmapData = { ...roadmap };
    const newSection = [...newRoadmapData[section]];

    if (newSection[index] && newSection[index].text !== text) {
      newSection[index] = { ...newSection[index], text: text };
      updateDocumentNonBlocking(roadmapRef, { [section]: newSection });
    }
    setEditing(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditing(null);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <Accordion type="multiple" defaultValue={['dailyHabits']} className="w-full space-y-6">
          {roadmapSections.map((section) => {
            const items = roadmap[section.key];
            if (!items || items.length === 0) return null;

            const progress = calculateProgress(items);

            return (
              <AccordionItem key={section.key} value={section.key} className="border border-border/60 rounded-xl overflow-hidden">
                <div className="flex flex-col">
                  <div className="px-4 py-3 flex items-center justify-between w-full hover:bg-muted/30 transition-colors">
                    <AccordionTrigger className="p-0 text-lg font-medium text-primary/90 hover:text-primary hover:no-underline [&>svg]:hidden flex-1 py-0 justify-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <section.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span>{section.title}</span>
                      </div>
                    </AccordionTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRegenerateSection(section.key);
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
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
                    {items.map((item: RoadmapItem, index: number) => {
                      const isEditing = editing?.section === section.key && editing.index === index;
                      const uniqueId = `${section.key}-${index}`;
                      return (
                        <li key={index} className="group flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
                          <Checkbox
                            id={`check-${uniqueId}`}
                            checked={item.completed}
                            onCheckedChange={(checked) => handleCheckChange(section.key, index, !!checked)}
                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex-1">
                            {isEditing ? (
                              <Input
                                id={`input-${uniqueId}`}
                                value={editing.text}
                                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                                onBlur={handleSaveEdit}
                                onKeyDown={handleInputKeyDown}
                                autoFocus
                                className="text-base h-8"
                              />
                            ) : (
                              <label
                                htmlFor={`check-${uniqueId}`}
                                className={cn(
                                  "text-sm sm:text-base text-foreground/90 cursor-pointer flex-1 leading-relaxed",
                                  item.completed && "line-through text-muted-foreground opacity-70"
                                )}
                              >
                                {item.text}
                              </label>
                            )}
                          </div>

                          {
                            !item.completed && !isEditing && (
                              <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                {section.key === 'dailyHabits' && (
                                  <FocusTimer
                                    habitName={item.text}
                                    className="border-none shadow-none bg-transparent p-0"
                                    onComplete={() => handleCheckChange(section.key, index, true)}
                                  />
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditing({ section: section.key, index, text: item.text })}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          }
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {roadmap.history && roadmap.history.length > 0 && (
            <AccordionItem value="history" className="border border-border/60 rounded-xl overflow-hidden">
              <AccordionTrigger className="px-4 py-3 text-lg font-medium text-primary/90 hover:text-primary hover:no-underline hover:bg-muted/30 transition-colors [&>svg]:hidden">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <span>Past Achievements</span>
                  </div>
                  <span className="text-sm text-muted-foreground mr-2">{roadmap.history.length} completed</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ul className="divide-y divide-border/50">
                  {roadmap.history.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground opacity-50 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm sm:text-base text-muted-foreground line-through opacity-70">
                          {item.text}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.completedAt ? (
                          new Date(item.completedAt.seconds * 1000).toLocaleDateString()
                        ) : (
                          'Archived'
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card >
  );
}
