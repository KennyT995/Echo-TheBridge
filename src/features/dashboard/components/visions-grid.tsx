
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
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
                    <Card key={vision.id} className="flex flex-col">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <CardTitle className="leading-tight">{vision.title}</CardTitle>
                                    {vision.category && (
                                        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-4 shrink-0">
                                            {vision.category}
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    Created{" "}
                                    {(() => {
                                        const date = vision.createdAt ? toJsDate(vision.createdAt) : null;
                                        return date
                                            ? formatDistanceToNow(date, { addSuffix: true })
                                            : "just now";
                                    })()}
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/vision/${vision.id}`}
                                            className="cursor-pointer flex items-center"
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer flex items-center"
                                        onClick={() => onDeleteVision(vision.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {vision.goal || "No goal description provided."}
                            </p>

                            {visionRoadmap ? (
                                <div className="pt-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            Overall Progress
                                        </span>
                                        <span className="text-xs font-bold text-primary">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                    <BridgeVisualizer progress={progress} className="h-10" />
                                </div>
                            ) : (
                                <div className="pt-2 text-xs text-muted-foreground italic text-center">
                                    No roadmap generated yet.
                                </div>
                            )}
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button asChild className="w-full">
                                <Link href={`/vision/${vision.id}`}>
                                    <Eye className="mr-2" /> View Vision
                                </Link>
                            </Button>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
