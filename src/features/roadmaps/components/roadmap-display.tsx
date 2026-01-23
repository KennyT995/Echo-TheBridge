import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import type { Roadmap, RoadmapItem, RoadmapSectionKey } from "@/lib/types";
import {
  CheckCircle2,
  CircleDot,
  GanttChartSquare,
  CalendarDays,
  Pencil,
  RefreshCw,
  Flag,
  Trash2,
  Plus,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DocumentReference, Timestamp } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { triggerMilestoneCelebration } from "@/lib/celebrations";
import { useToast } from "@/hooks/use-toast";
import { History } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoadmapDisplayProps {
  roadmap: Roadmap;
  roadmapRef: DocumentReference | null;
  onRegenerateSection: (section: RoadmapSectionKey) => void;
  readOnly?: boolean;
}

const roadmapSections = [
  {
    title: "Vision Timeline",
    key: "visionTimeline",
    icon: Flag,
  },
  {
    title: "Yearly Milestones",
    key: "yearlyMilestones",
    icon: GanttChartSquare,
  },
  {
    title: "Monthly Sprints",
    key: "monthlySprints",
    icon: CalendarDays,
  },
  {
    title: "Weekly Tactics",
    key: "weeklyTactics",
    icon: CircleDot,
  },
  {
    title: "Daily Habits",
    key: "dailyHabits",
    icon: CheckCircle2,
  },
] as const;

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
    colors: ["#22c55e", "#ec4899", "#3b82f6", "#eab308"],
    startVelocity: 30 + Math.random() * 20,
    gravity: 0.8,
    drift: Math.random() - 0.5,
    ticks: 300,
  });
};

export function RoadmapDisplay({
  roadmap,
  roadmapRef,
  onRegenerateSection,
  readOnly = false,
}: RoadmapDisplayProps) {
  const [editing, setEditing] = useState<{
    section: RoadmapSectionKey;
    index: number;
    text: string;
  } | null>(null);

  const { toast } = useToast();

  if (!roadmap) return null;

  const calculateProgress = (items: RoadmapItem[]) => {
    if (!items || items.length === 0) return 0;
    const completedCount = items.filter((item) => item.completed).length;
    return (completedCount / items.length) * 100;
  };

  // triggerCelebration MOVED OUTSIDE

  const shouldTellUserToRegenerate = (
    section: RoadmapSectionKey,
    items: RoadmapItem[],
  ): { should: boolean; reason?: string } => {
    if (!items || items.length === 0)
      return { should: true, reason: "Empty section" };

    const allCompleted = items.every((i) => i.completed);
    if (allCompleted) return { should: true, reason: "All tasks completed" };

    const now = new Date();

    switch (section) {
      case "dailyHabits":
        // Reminder after 6 PM
        if (now.getHours() >= 18)
          return { should: true, reason: "End of day approaching" };
        break;
      case "weeklyTactics":
        // Reminder on Friday (5), Saturday (6), Sunday (0)
        const day = now.getDay();
        if (day === 0 || day === 5 || day === 6)
          return { should: true, reason: "End of week approaching" };
        break;
      case "monthlySprints":
        // Reminder after 25th of the month
        if (now.getDate() >= 25)
          return { should: true, reason: "End of month approaching" };
        break;
      case "yearlyMilestones":
        // Reminder in December (11)
        if (now.getMonth() === 11)
          return { should: true, reason: "End of year approaching" };
        break;
    }

    return { should: false };
  };

  const handleCheckChange = (
    section: RoadmapSectionKey,
    index: number,
    checked: boolean,
  ) => {
    if (!roadmapRef || readOnly) return;

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
        const isVisionComplete = allItems.every((item) => item.completed);

        if (isVisionComplete) {
          triggerMilestoneCelebration("vision", toast);
        } else {
          const isSectionComplete = newSection.every((item) => item.completed);
          const wasSectionComplete = roadmap[section].every(
            (item) => item.completed,
          );

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

  const handleDelete = (section: RoadmapSectionKey, index: number) => {
    if (!roadmapRef) return;
    const newRoadmapData = { ...roadmap };
    const newSection = [...newRoadmapData[section]];
    newSection.splice(index, 1);
    updateDocumentNonBlocking(roadmapRef, { [section]: newSection });
  };

  const handleAdd = (section: RoadmapSectionKey) => {
    if (!roadmapRef) return;
    const newRoadmapData = { ...roadmap };
    const newSection = [
      ...newRoadmapData[section],
      { text: "", completed: false },
    ];

    // We update the DB immediately with the empty item.
    // This allows it to render, and we then set it to editing state.
    // Ideally we'd have local state for instant feedback, but for now this is consistent with the app's architecture.
    updateDocumentNonBlocking(roadmapRef, { [section]: newSection });

    // We can't synchronously set editing because the item doesn't exist in the 'roadmap' prop yet until Firestore emits.
    // However, since we optimistic update via 'updateDocumentNonBlocking' (which usually just writes),
    // we can try to set editing and hope the re-render happens quickly.
    // Actually, let's just write to DB. The user will see the empty row appear (if we rendered empty rows).
    // But we filter empty rows? No, we don't.
    // So we will see a row with empty text.
    // We need to identify it to auto-focus.
    // Let's rely on the index.
    setEditing({ section, index: newSection.length - 1, text: "" });
  };

  const handleSaveEdit = () => {
    if (!roadmapRef || !editing) return;

    const { section, index, text } = editing;
    const newRoadmapData = { ...roadmap };
    const newSection = [...newRoadmapData[section]];

    // If the section/index is valid
    if (newSection[index]) {
      if (text.trim() === "") {
        // Remove if empty (cancelling an add, or clearing a task)
        newSection.splice(index, 1);
        updateDocumentNonBlocking(roadmapRef, { [section]: newSection });
      } else if (newSection[index].text !== text) {
        // Update text
        newSection[index] = { ...newSection[index], text: text };
        updateDocumentNonBlocking(roadmapRef, { [section]: newSection });
      }
    }
    setEditing(null);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      // If we are escaping a new item that is empty, handleSaveEdit will remove it because text is empty in state?
      // Wait, editing.text is whatever was typed. If they typed nothing, it's empty.
      handleSaveEdit();
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <Accordion
          type="multiple"
          defaultValue={["dailyHabits"]}
          className="w-full space-y-6"
        >
          {roadmapSections.map((section) => {
            const items = roadmap[section.key];
            if (!items || items.length === 0) return null;

            const progress = calculateProgress(items);

            return (
              <AccordionItem
                key={section.key}
                value={section.key}
                className="border border-border/60 rounded-xl overflow-hidden"
              >
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8 shrink-0 ml-2 transition-all",
                                shouldTellUserToRegenerate(section.key, items)
                                  .should
                                  ? "text-amber-500 hover:text-amber-600 hover:bg-amber-100 animate-pulse"
                                  : "text-muted-foreground hover:text-primary",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRegenerateSection(section.key);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                        </TooltipTrigger>
                        {shouldTellUserToRegenerate(section.key, items)
                          .should && (
                          <TooltipContent>
                            <p>
                              {
                                shouldTellUserToRegenerate(section.key, items)
                                  .reason
                              }{" "}
                              - Click to regenerate
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
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
                      const isEditing =
                        editing?.section === section.key &&
                        editing.index === index;
                      const uniqueId = `${section.key}-${index}`;
                      return (
                        <li
                          key={index}
                          className="group flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors"
                        >
                          <Checkbox
                            id={`check-${uniqueId}`}
                            checked={item.completed}
                            onCheckedChange={(checked) =>
                              handleCheckChange(section.key, index, !!checked)
                            }
                            disabled={readOnly}
                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <Input
                                id={`input-${uniqueId}`}
                                value={editing.text}
                                onChange={(e) =>
                                  setEditing({
                                    ...editing,
                                    text: e.target.value,
                                  })
                                }
                                onBlur={handleSaveEdit}
                                onKeyDown={handleInputKeyDown}
                                autoFocus
                                className="text-base h-8"
                              />
                            ) : (
                              <label
                                htmlFor={`check-${uniqueId}`}
                                className={cn(
                                  "text-sm sm:text-base text-foreground/90 cursor-pointer flex-1 leading-relaxed min-w-0 break-words",
                                  item.completed &&
                                    "line-through text-muted-foreground opacity-70",
                                  readOnly && "cursor-default",
                                )}
                              >
                                {item.text}
                              </label>
                            )}
                          </div>

                          {!item.completed && !isEditing && !readOnly && (
                            <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(section.key, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setEditing({
                                    section: section.key,
                                    index,
                                    text: item.text,
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {!readOnly && (
                    <div className="p-2 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-primary gap-2"
                        onClick={() => handleAdd(section.key)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Item
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}

          {roadmap.history && roadmap.history.length > 0 && (
            <AccordionItem
              value="history"
              className="border border-border/60 rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 text-lg font-medium text-primary/90 hover:text-primary hover:no-underline hover:bg-muted/30 transition-colors [&>svg]:hidden">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <span>Past Achievements</span>
                  </div>
                  <span className="text-sm text-muted-foreground mr-2">
                    {roadmap.history.length} completed
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <ul className="divide-y divide-border/50">
                  {roadmap.history.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors"
                    >
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground opacity-50 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-sm sm:text-base text-muted-foreground line-through opacity-70">
                          {item.text}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.completedAt
                          ? (item.completedAt instanceof Date
                              ? item.completedAt
                              : (item.completedAt as Timestamp).toDate
                                ? (item.completedAt as Timestamp).toDate()
                                : new Date(
                                    (item.completedAt as { seconds: number })
                                      .seconds * 1000,
                                  )
                            ).toLocaleDateString()
                          : "Archived"}
                      </span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
