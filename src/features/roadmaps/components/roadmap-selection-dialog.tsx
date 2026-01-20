import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Roadmap, RoadmapItem } from '@/lib/types';
import { CalendarDays, CheckCircle2, CircleDot, GanttChartSquare, Flag } from 'lucide-react';

interface RoadmapSelectionDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    proposedRoadmap: Roadmap;
    onConfirm: (selectedRoadmap: Roadmap) => void;
}

type SelectionState = Record<string, boolean>;

export function RoadmapSelectionDialog({
    isOpen,
    onOpenChange,
    proposedRoadmap,
    onConfirm,
}: RoadmapSelectionDialogProps) {
    const [selections, setSelections] = useState<SelectionState>({});

    // Initialize selections when prop changes
    useEffect(() => {
        if (proposedRoadmap) {
            const initial: SelectionState = {};
            const sections = ['visionTimeline', 'dailyHabits', 'weeklyTactics', 'monthlySprints', 'yearlyMilestones'] as const;

            sections.forEach((key) => {
                const items = proposedRoadmap[key];
                if (items) {
                    items.forEach((item, index) => {
                        initial[`${key}-${index}`] = true; // All selected by default
                    });
                }
            });
            setSelections(initial);
        }
    }, [proposedRoadmap]);

    const toggleSelection = (key: string, index: number) => {
        const id = `${key}-${index}`;
        setSelections((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleConfirm = () => {
        // Filter the roadmap based on selections
        const filteredRoadmap: Roadmap = {
            ...proposedRoadmap,
            visionTimeline: filterSection('visionTimeline'),
            dailyHabits: filterSection('dailyHabits'),
            weeklyTactics: filterSection('weeklyTactics'),
            monthlySprints: filterSection('monthlySprints'),
            yearlyMilestones: filterSection('yearlyMilestones'),
        };
        onConfirm(filteredRoadmap);
    };

    const filterSection = (key: keyof Roadmap): RoadmapItem[] => {
        const items = proposedRoadmap[key] as RoadmapItem[];
        if (!items) return [];
        return items.filter((_, index) => !!selections[`${key}-${index}`]);
    };

    const sections = [
        { key: 'visionTimeline', label: 'Vision Timeline', icon: Flag },
        { key: 'dailyHabits', label: 'Daily Habits', icon: CheckCircle2 },
        { key: 'weeklyTactics', label: 'Weekly Tactics', icon: CircleDot },
        { key: 'monthlySprints', label: 'Monthly Sprints', icon: CalendarDays },
        { key: 'yearlyMilestones', label: 'Yearly Milestones', icon: GanttChartSquare },
    ] as const;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Review Your Roadmap</DialogTitle>
                    <DialogDescription>
                        Select the tasks you want to keep. Uncheck any that don't fit your vision.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <Accordion type="multiple" defaultValue={['dailyHabits', 'weeklyTactics', 'monthlySprints', 'yearlyMilestones']} className="space-y-4">
                        {sections.map((section) => (
                            <AccordionItem key={section.key} value={section.key} className="border rounded-md px-4">
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
                                        {(proposedRoadmap[section.key] as RoadmapItem[]).map((item, index) => {
                                            const id = `${section.key}-${index}`;
                                            const isSelected = !!selections[id];
                                            return (
                                                <div key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                                    <Checkbox
                                                        id={id}
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleSelection(section.key, index)}
                                                    />
                                                    <label
                                                        htmlFor={id}
                                                        className={`text-sm cursor-pointer leading-tight ${isSelected ? 'text-foreground' : 'text-muted-foreground line-through opacity-70'}`}
                                                    >
                                                        {item.text}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>

                <DialogFooter className="pt-4 border-t mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm & Save Selection</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
