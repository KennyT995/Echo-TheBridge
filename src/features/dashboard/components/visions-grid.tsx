
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Eye, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BridgeVisualizer } from "@/features/roadmaps/components/bridge-visualizer";
import { toJsDate, calculateOverallProgress } from "@/lib/utils";
import type { Vision, Roadmap } from "@/lib/types";

interface VisionsGridProps {
    visions: Vision[];
    roadmapsById: Record<string, Roadmap>;
    onDeleteVision: (visionId: string) => void;
}

export function VisionsGrid({
    visions,
    roadmapsById,
    onDeleteVision,
}: VisionsGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visions.map((vision) => {
                const visionRoadmap = roadmapsById[vision.id];
                const progress = visionRoadmap
                    ? calculateOverallProgress(visionRoadmap)
                    : 0;

                return (
                    <Card key={vision.id} className="group flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 border-border/50 bg-secondary/5 backdrop-blur-sm overflow-hidden relative">
                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -z-10 transition-opacity group-hover:opacity-100 opacity-0" />

                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                            <div className="space-y-1.5 pr-4 flex-1">
                                <div className="flex items-start justify-between gap-2 overflow-hidden">
                                    <CardTitle className="leading-tight font-headline font-bold text-xl group-hover:text-primary transition-colors line-clamp-2">
                                        {vision.title}
                                    </CardTitle>
                                    {vision.category && (
                                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider py-0 px-2 h-5 shrink-0 bg-primary/10 text-primary border-none">
                                            {vision.category}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                                    {(() => {
                                        const rawDate = vision.createdAt ? toJsDate(vision.createdAt) : null;
                                        return rawDate
                                            ? formatDistanceToNow(rawDate as Date, { addSuffix: true })
                                            : "just now";
                                    })()}
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/vision/${vision.id}`}
                                            className="cursor-pointer flex items-center py-2.5"
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer flex items-center py-2.5"
                                        onClick={() => onDeleteVision(vision.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Vision
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[4.5rem]">
                                {vision.goal || "No goal description provided."}
                            </p>

                            <div className="pt-2 border-t border-border/40">
                                {visionRoadmap ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                Bridge Integrity
                                            </span>
                                            <span className="text-lg font-bold font-headline text-primary">
                                                {Math.round(progress)}%
                                            </span>
                                        </div>
                                        <BridgeVisualizer progress={progress} className="h-12" />
                                    </div>
                                ) : (
                                    <div className="py-4 text-xs font-medium text-muted-foreground/60 italic text-center rounded-lg bg-muted/20 border border-dashed border-border/60">
                                        Architecting roadmap...
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button asChild className="w-full h-11 rounded-xl font-bold bg-secondary hover:bg-primary hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300 transform group-active:scale-[0.98]">
                                <Link href={`/vision/${vision.id}`} className="flex items-center justify-center gap-2">
                                    Launch Interface <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
