import { cn } from "@/lib/utils";

interface BridgeVisualizerProps {
    progress: number; // 0 to 100
    totalPlanks?: number;
    className?: string;
}

export function BridgeVisualizer({ progress, totalPlanks = 10, className }: BridgeVisualizerProps) {
    // Ensure progress is clamped between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress));

    // Calculate how many planks should be "built"
    // If progress is 50%, 5 out of 10 planks show up.
    // However, for a bridge, we might want to show the whole bridge structure in a "ghost" state
    // and fill it in as we go.

    // Let's optimize visual balance: 
    // We want the bridge to be fully built at 100%. 
    // So distinct plank indices 0 to totalPlanks-1.
    // A plank i is "built" if (i + 1) / totalPlanks <= progress / 100

    // For smoother animation, we can animate the width of the "filled" path?
    // But individual planks look cooler for "building".

    const planks = Array.from({ length: totalPlanks }, (_, i) => i);
    const planksBuiltCount = Math.floor((clampedProgress / 100) * totalPlanks);

    return (
        <div className={cn("relative w-full h-12 flex items-center justify-center", className)}>
            {/* The Chasm / Background decorations */}
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-indigo-950/10 to-transparent" />

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 60"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                {/* Bridge Arch / Support Structure (Ghost) */}
                <path
                    d="M10,50 Q150,5 290,50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted-foreground/20"
                    strokeDasharray="4 4"
                />

                {/* Bridge Arch / Support Structure (Filled) */}
                {/* We only draw the arch as far as we have progressed? 
                    Maybe just keep the arch static as the "Blueprint" and build planks.
                */}

                {/* Planks */}
                {planks.map((i) => {
                    // Calculate position along the quadratic bezier curve
                    // simple approx: linear x, quadratic y
                    // t goes from 0 to 1
                    const t = i / (totalPlanks - 1);
                    const x = 10 + t * (290 - 10);

                    // Bezier calc for Y: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
                    // P0=(10,50), P1=(150, 5), P2=(290, 50)
                    // y = (1-t)^2*50 + 2*(1-t)*t*5 + t^2*50
                    const y = Math.pow(1 - t, 2) * 50 + 2 * (1 - t) * t * 5 + Math.pow(t, 2) * 50;

                    const isBuilt = i < planksBuiltCount;

                    return (
                        <g key={i}>
                            {/* Ghost Plank */}
                            <rect
                                x={x - 4}
                                y={y - 2}
                                width="8"
                                height="4"
                                rx="1"
                                className="fill-muted-foreground/10"
                            />
                            {/* Built Plank */}
                            <rect
                                x={x - 4}
                                y={y - 2}
                                width="8"
                                height="4"
                                rx="1"
                                className={cn(
                                    "transition-all duration-700 ease-out",
                                    isBuilt ? "fill-indigo-500 dark:fill-indigo-400 opacity-100" : "opacity-0 translate-y-4"
                                )}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Future Self Icon at the end? */}
        </div>
    );
}
