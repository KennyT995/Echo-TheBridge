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
import { cn } from "@/lib/utils";

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
  const [userOverrides, setUserOverrides] = useState<Record<string, boolean>>(
    {},
  );



  const toggleSelection = (key: string, index: number) => {
    const id = `${key}-${index}`;
    setUserOverrides((prev) => {
      const isSelected = prev[id] !== false; // Default is true
      return { ...prev, [id]: !isSelected };
    });
  };

  const isSelected = (key: string, index: number) => {
    const id = `${key}-${index}`;
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] glass-card border-white/5 p-0 overflow-hidden flex flex-col shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10" />

        <DialogHeader className="p-8 pb-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <GanttChartSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
              Architectural Review
            </span>
          </div>
          <DialogTitle className="text-4xl font-headline font-bold tracking-tighter">
            Audit Your <span className="text-gradient">Trajectory</span>
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/60 font-light mt-2">
            Calibrate the proposed roadmap. De-select elements that do not align with your singular intent.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-8">
          <ScrollArea className="h-full pr-6">
            <Accordion
              type="multiple"
              defaultValue={sections.map((s) => s.key)}
              className="space-y-6"
            >
              {sections.map((section) => {
                const items = proposedRoadmap[section.key] as
                  | RoadmapItem[]
                  | undefined;

                if (!items) return null;
                const filteredItems = filterSection(section.key);

                return (
                  <AccordionItem
                    key={section.key}
                    value={section.key}
                    className="border border-white/5 rounded-[2rem] px-6 bg-white/5 backdrop-blur-sm overflow-hidden transition-all hover:bg-white/10"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="flex items-center gap-4 w-full">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                          <section.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <span className="text-xl font-bold tracking-tight block">{section.label}</span>
                          <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-widest leading-none">
                            {filteredItems.length} of {items.length} units active
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-8">
                      <div className="grid gap-3">
                        {items.map((item, index) => {
                          const id = `${section.key}-${index}`;
                          const selected = isSelected(section.key, index);
                          return (
                            <div
                              key={index}
                              onClick={() => toggleSelection(section.key, index)}
                              className={cn(
                                "flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group",
                                selected
                                  ? "bg-primary/5 border-primary/20 text-white"
                                  : "bg-white/2 border-transparent text-muted-foreground/40 opacity-60"
                              )}
                            >
                              <Checkbox
                                id={id}
                                checked={selected}
                                onCheckedChange={() => toggleSelection(section.key, index)}
                                className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <label
                                htmlFor={id}
                                className={cn(
                                  "text-lg cursor-pointer leading-tight font-light transition-all",
                                  !selected && "line-through"
                                )}
                                onClick={(e) => e.preventDefault()}
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
        </div>

        <DialogFooter className="p-8 border-t border-white/5 bg-white/5 backdrop-blur-xl gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-14 px-8 rounded-2xl text-muted-foreground hover:bg-white/5 transition-all text-lg"
          >
            Abort Initialization
          </Button>
          <Button
            onClick={handleConfirm}
            className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all text-lg"
          >
            Confirm Strategic Build
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


