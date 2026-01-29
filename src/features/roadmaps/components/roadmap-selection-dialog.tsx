import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Roadmap, RoadmapItem } from "@/lib/types";
import {
  CalendarDays,
  CheckCircle2,
  CircleDot,
  GanttChartSquare,
  Flag,
} from "lucide-react";

interface RoadmapSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proposedRoadmap: Roadmap;
  onConfirm: (selectedRoadmap: Roadmap) => void;
}

export function RoadmapSelectionDialog({
  isOpen,
  onOpenChange,
  proposedRoadmap,
  onConfirm,
}: RoadmapSelectionDialogProps) {
  // Store user overrides: true = checked, false = unchecked, undefined = default (checked)
  const [userOverrides, setUserOverrides] = useState<Record<string, boolean>>(
    {},
  );

  // Reset overrides when roadmap changes (effectively a new session)
  // We can use a key on the parent, but since we are inside, we can just clear overrides if ID changes?
  // For now, simpler: just rely on the user manually unchecking things.
  // If we want to strictly reset when `proposedRoadmap` object changes reference:
  /*
    const [prevRoadmap, setPrevRoadmap] = useState(proposedRoadmap);
    if (proposedRoadmap !== prevRoadmap) {
        setPrevRoadmap(proposedRoadmap);
        setUserOverrides({});
    }
    */
  // Actually, the useEffect pattern is fine if we suppress strict mode warning,
  // BUT the derived state pattern is better.
  // Let's stick to the simplest fix for the lint:
  // Just initialize state with the values, and use key={proposedRoadmap.id} in the parent if possible.
  // Since I can't touch parent easily, I'll use the "state from props" pattern with an effect but ensure it's clean.
  // Actually, the lint error was "Calling setState synchronously within an effect".
  // I can't assume the previous code was doing it synchronously because of missing dependency or something?
  // No, it was just inside useEffect.

  // Alternative: Use a key on the Dialog content content? No.

  // Let's implement the "userOverrides" pattern.
  // Default is ALL selected.

  const toggleSelection = (key: string, index: number) => {
    const id = `${key}-${index}`;
    setUserOverrides((prev) => {
      // If currently true (default), setting to false.
      // If currently false (overridden), setting to true (default).
      // We can just toggle boolean.
      const isSelected = prev[id] !== false; // Default is true
      return { ...prev, [id]: !isSelected };
    });
  };

  const isSelected = (key: string, index: number) => {
    const id = `${key}-${index}`;
    // Default true, unless overridden to false
    return userOverrides[id] !== false;
  };

  const handleConfirm = () => {
    // Filter the roadmap based on selections
    const filteredRoadmap: Roadmap = {
      ...proposedRoadmap,
      visionTimeline: filterSection("visionTimeline"),
      dailyHabits: filterSection("dailyHabits"),
      weeklyTactics: filterSection("weeklyTactics"),
      monthlySprints: filterSection("monthlySprints"),
      yearlyMilestones: filterSection("yearlyMilestones"),
    };
    onConfirm(filteredRoadmap);
  };

  const filterSection = (key: keyof Roadmap): RoadmapItem[] => {
    const items = proposedRoadmap[key] as RoadmapItem[];
    if (!items) return [];
    return items.filter((_, index) => isSelected(key as string, index));
  };

  const sections = [
    { key: "visionTimeline", label: "Vision Timeline", icon: Flag },
    { key: "dailyHabits", label: "Daily Habits", icon: CheckCircle2 },
    { key: "weeklyTactics", label: "Weekly Tactics", icon: CircleDot },
    { key: "monthlySprints", label: "Monthly Sprints", icon: CalendarDays },
    {
      key: "yearlyMilestones",
      label: "Yearly Milestones",
      icon: GanttChartSquare,
    },
  ] as const;

  // Clear overrides when dialog closes or opens?
  // Better to clear when `proposedRoadmap` changes.
  // We can use the stash-state pattern.
  const [prevRoadmapRef, setPrevRoadmapRef] = useState(proposedRoadmap);
  if (proposedRoadmap !== prevRoadmapRef) {
    setPrevRoadmapRef(proposedRoadmap);
    setUserOverrides({});
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Your Roadmap</DialogTitle>
          <DialogDescription>
            Select the tasks you want to keep. Uncheck any that don&apos;t fit
            your vision.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Accordion
            type="multiple"
            defaultValue={sections.map((s) => s.key)}
            className="space-y-4"
          >
            {sections.map((section) => {
              const items = proposedRoadmap[section.key] as
                | RoadmapItem[]
                | undefined;

              // If the proposed roadmap doesn't contain this section, don't render it.
              if (!items) {
                return null;
              }

              return (
                <AccordionItem
                  key={section.key}
                  value={section.key}
                  className="border rounded-md px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <section.icon className="w-5 h-5 text-primary" />
                      <span>{section.label}</span>
                      <span className="text-xs text-muted-foreground ml-2 font-normal">
                        ({filterSection(section.key).length} selected)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-2">
                      {items.map((item, index) => {
                        const id = `${section.key}-${index}`;
                        const selected = isSelected(section.key, index);
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={id}
                              checked={selected}
                              onCheckedChange={() =>
                                toggleSelection(section.key, index)
                              }
                            />
                            <label
                              htmlFor={id}
                              className={`text-sm cursor-pointer leading-tight ${
                                selected
                                  ? "text-foreground"
                                  : "text-muted-foreground line-through opacity-70"
                              }`}
                            >
                              {item.text}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm & Save Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
