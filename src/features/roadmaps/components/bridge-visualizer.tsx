import { cn } from "@/lib/utils";

interface BridgeVisualizerProps {
  progress: number; // 0 to 100
  totalPlanks?: number;
  className?: string;
}

export function BridgeVisualizer({
  progress,
  totalPlanks = 15,
  className,
}: BridgeVisualizerProps) {
  // Ensure progress is clamped between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Plank Generation Logic
  const startPoint = { x: 10, y: 50 };
  const controlPoint = { x: 150, y: 5 };
  const endPoint = { x: 290, y: 50 };

  const planks = Array.from({ length: totalPlanks }, (_, i) => {
    const t = i / (totalPlanks - 1);

    // Position: Quadratic Bezier
    // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const x =
      Math.pow(1 - t, 2) * startPoint.x +
      2 * (1 - t) * t * controlPoint.x +
      Math.pow(t, 2) * endPoint.x;
    const y =
      Math.pow(1 - t, 2) * startPoint.y +
      2 * (1 - t) * t * controlPoint.y +
      Math.pow(t, 2) * endPoint.y;

    // Rotation: Tangent vector
    // B'(t) = 2(1-t)(P1 - P0) + 2t(P2 - P1)
    const dx =
      2 * (1 - t) * (controlPoint.x - startPoint.x) +
      2 * t * (endPoint.x - controlPoint.x);
    const dy =
      2 * (1 - t) * (controlPoint.y - startPoint.y) +
      2 * t * (endPoint.y - controlPoint.y);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return { index: i, x, y, angle };
  });

  const planksBuiltCount = Math.round((clampedProgress / 100) * totalPlanks);

  return (
    <div
      className={cn(
        "relative w-full h-16 flex items-center justify-center",
        className,
      )}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Planks */}
        {planks.map(({ index, x, y, angle }) => {
          const isBuilt = index < planksBuiltCount;

          return (
            <g
              key={index}
              style={{
                transformOrigin: `${x}px ${y}px`,
                transform: `rotate(${angle}deg)`,
              }}
            >
              {/* Plank Dash */}
              <rect
                x={x - 6} // Centered horizontally
                y={y - 1.5} // Centered vertically
                width="12"
                height="3"
                rx="1.5"
                className={cn(
                  "transition-all duration-700 ease-out",
                  isBuilt
                    ? "fill-indigo-500 dark:fill-indigo-400 drop-shadow-[0_0_3px_rgba(99,102,241,0.6)]"
                    : "fill-muted-foreground/20",
                )}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
