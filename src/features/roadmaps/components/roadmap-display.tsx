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
import { ScrollArea } from "@/components/ui/scroll-area";

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
    color: "bg-indigo-500",
    lightColor: "bg-indigo-50/50 dark:bg-indigo-950/20",
    borderColor: "border-indigo-100 dark:border-indigo-900/30",
    textColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Yearly Milestones",
    key: "yearlyMilestones",
    icon: GanttChartSquare,
    color: "bg-blue-500",
    lightColor: "bg-blue-50/50 dark:bg-blue-950/20",
    borderColor: "border-blue-100 dark:border-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Monthly Sprints",
    key: "monthlySprints",
    icon: CalendarDays,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50/50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-100 dark:border-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Weekly Tactics",
    key: "weeklyTactics",
    icon: CircleDot,
    color: "bg-amber-500",
    lightColor: "bg-amber-50/50 dark:bg-amber-950/20",
    borderColor: "border-amber-100 dark:border-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Daily Habits",
    key: "dailyHabits",
    icon: CheckCircle2,
    color: "bg-orange-500",
    lightColor: "bg-orange-50/50 dark:bg-orange-950/20",
    borderColor: "border-orange-100 dark:border-orange-900/30",
    textColor: "text-orange-600 dark:text-orange-400",
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
          ...(tempFullRoadmap.visionTimeline || []),
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
    <Card className="w-full glass-card border-white/5 shadow-2xl overflow-hidden">
      <CardContent className="p-0">
        <Accordion
          type="multiple"
          defaultValue={["dailyHabits"]}
          className="w-full divide-y divide-white/5"
        >
          {roadmapSections.map((section) => {
            const items = roadmap[section.key];
            if (!items || items.length === 0) return null;

            const progress = calculateProgress(items);

            return (
              <AccordionItem
                key={section.key}
                value={section.key}
                className="border-none"
              >
                <div className="flex flex-col group">
                  <div className={cn("px-8 py-6 flex items-center justify-between w-full transition-all duration-500", section.lightColor)}>
                    <AccordionTrigger className="p-0 text-lg font-bold hover:no-underline [&>svg]:hidden flex-1 py-0 justify-start">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "p-3 rounded-2xl shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                          section.color,
                          "text-white border border-white/20"
                        )}>
                          <section.icon className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                          <span className={cn("text-2xl font-headline font-black tracking-tighter block", section.textColor)}>
                            {section.title}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-none">
                            Sector Calibration // {items.length} Units
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className={cn("text-xs font-black uppercase tracking-widest", section.textColor)}>
                          {Math.round(progress)}% Complete
                        </span>
                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={cn("h-full transition-all duration-1000 ease-out", section.color)}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {!readOnly && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-12 w-12 shrink-0 rounded-2xl transition-all border border-transparent",
                                  shouldTellUserToRegenerate(section.key, items).should
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                    : "text-muted-foreground/40 hover:bg-white/5 hover:text-white"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRegenerateSection(section.key);
                                }}
                              >
                                <RefreshCw className="h-5 w-5" />
                              </Button>
                            )}
                          </TooltipTrigger>
                          {shouldTellUserToRegenerate(section.key, items).should && (
                            <TooltipContent className="bg-amber-500 text-white font-bold border-none rounded-xl p-4 shadow-2xl">
                              <p className="text-sm">
                                {shouldTellUserToRegenerate(section.key, items).reason}
                              </p>
                              <p className="text-[10px] uppercase tracking-widest opacity-80 mt-1">Click to Resynthesize</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <AccordionContent className="p-0 border-t border-white/5 bg-black/20">
                  <ScrollArea className="max-h-[600px]">
                    <ul className="divide-y divide-white/5">
                      {items.map((item: RoadmapItem, index: number) => {
                        const isEditing =
                          editing?.section === section.key &&
                          editing.index === index;
                        const uniqueId = `${section.key}-${index}`;
                        return (
                          <li
                            key={index}
                            className={cn(
                              "group flex items-center gap-6 p-6 transition-all duration-300",
                              item.completed ? "bg-white/[0.02]" : "hover:bg-white/[0.05]"
                            )}
                          >
                            <div className="relative">
                              <Checkbox
                                id={`check-${uniqueId}`}
                                checked={item.completed}
                                onCheckedChange={(checked) =>
                                  handleCheckChange(
                                    section.key,
                                    index,
                                    !!checked,
                                  )
                                }
                                disabled={readOnly}
                                className="h-7 w-7 rounded-lg border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
                              />
                              {item.completed && (
                                <div className="absolute inset-0 bg-primary/20 blur-lg -z-10 animate-fade-in" />
                              )}
                            </div>

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
                                  className="text-xl h-12 bg-white/5 border-primary/40 rounded-xl px-4 font-light"
                                />
                              ) : (
                                <label
                                  htmlFor={`check-${uniqueId}`}
                                  className={cn(
                                    "text-lg sm:text-xl text-white/80 cursor-pointer flex-1 leading-relaxed min-w-0 break-words font-light transition-all duration-300",
                                    item.completed && "line-through text-muted-foreground/40 opacity-50",
                                    readOnly && "cursor-default",
                                  )}
                                >
                                  {item.text}
                                </label>
                              )}
                            </div>

                            {!item.completed && !isEditing && !readOnly && (
                              <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20"
                                  onClick={() =>
                                    handleDelete(section.key, index)
                                  }
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                                  onClick={() =>
                                    setEditing({
                                      section: section.key,
                                      index,
                                      text: item.text,
                                    })
                                  }
                                >
                                  <Pencil className="h-5 w-5" />
                                </Button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                  {!readOnly && (
                    <div className="p-4 bg-white/[0.02]">
                      <Button
                        variant="ghost"
                        className="w-full h-14 justify-center text-muted-foreground/40 hover:text-primary gap-3 rounded-2xl border border-dashed border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all text-lg font-light"
                        onClick={() => handleAdd(section.key)}
                      >
                        <Plus className="h-6 w-6" />
                        Deploy New Objective
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
              className="border-none"
            >
              <AccordionTrigger className="px-8 py-6 text-2xl font-headline font-black tracking-tighter text-muted-foreground/60 hover:text-primary hover:no-underline transition-all [&>svg]:hidden">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                      <History className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div className="text-left">
                      <span className="block">Past Achievements</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 leading-none">
                        Historical Records // {roadmap.history.length} Units
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 border-t border-white/5 bg-black/40">
                <ScrollArea className="max-h-[400px]">
                  <ul className="divide-y divide-white/5">
                    {roadmap.history.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-6 p-6 hover:bg-white/[0.02] transition-colors"
                      >
                        <CheckCircle2 className="h-6 w-6 text-muted-foreground/20 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-lg text-muted-foreground/40 line-through font-light">
                            {item.text}
                          </span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/20">
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
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
