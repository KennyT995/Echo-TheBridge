
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visions.map((vision, index) => {
                const visionRoadmap = roadmapsById[vision.id];
                const progress = visionRoadmap
                    ? calculateOverallProgress(visionRoadmap)
                    : 0;

                return (
                    <Card key={vision.id} className="group flex flex-col transition-all duration-500 hover:-translate-y-3 glass-card border-white/5 overflow-hidden relative animate-reveal" style={{ animationDelay: `${index * 100}ms` }}>
                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[100px] rounded-full -z-10 transition-opacity group-hover:opacity-100 opacity-0" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 blur-[100px] rounded-full -z-10 transition-opacity group-hover:opacity-100 opacity-0" />

                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
                            <div className="space-y-2 pr-4 flex-1">
                                <div className="flex items-start justify-between gap-3 overflow-hidden">
                                    <CardTitle className="leading-tight font-headline font-bold text-2xl group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                                        {vision.title}
                                    </CardTitle>
                                    {vision.category && (
                                        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-[0.1em] py-0.5 px-2.5 h-6 shrink-0 glass border-primary/20 text-primary">
                                            {vision.category}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
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
                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl glass hover:bg-primary/20 hover:text-primary transition-all">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-2xl glass-card p-2 border-white/10">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/vision/${vision.id}`}
                                            className="cursor-pointer flex items-center py-3 px-4 rounded-xl focus:bg-primary/10 transition-colors"
                                        >
                                            <Eye className="mr-3 h-5 w-5" /> View Details
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer flex items-center py-3 px-4 rounded-xl focus:bg-destructive/10 transition-colors"
                                        onClick={() => onDeleteVision(vision.id)}
                                    >
                                        <Trash2 className="mr-3 h-5 w-5" /> Delete Vision
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-8 relative z-10">
                            <p className="text-base text-muted-foreground/80 line-clamp-3 leading-relaxed min-h-[4.5rem] font-light italic">
                                &quot;{vision.goal || "No goal description provided."}&quot;
                            </p>

                            <div className="pt-6 border-t border-white/5">
                                {visionRoadmap ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                                                Bridge Integrity
                                            </span>
                                            <span className="text-2xl font-bold font-headline text-primary">
                                                {Math.round(progress)}%
                                            </span>
                                        </div>
                                        <BridgeVisualizer progress={progress} className="h-16" />
                                    </div>
                                ) : (
                                    <div className="py-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/40 italic text-center rounded-3xl glass border border-dashed border-white/10">
                                        Architecting roadmap...
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-8 pt-0 relative z-10">
                            <Button asChild className="w-full h-14 rounded-2xl font-bold glass border-primary/20 hover:bg-primary hover:text-primary-foreground group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all duration-500 transform group-active:scale-[0.98]">
                                <Link href={`/vision/${vision.id}`} className="flex items-center justify-center gap-3 text-lg">
                                    Launch Interface <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                                </Link>
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

