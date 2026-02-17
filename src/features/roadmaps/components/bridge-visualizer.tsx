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
        "relative w-full h-24 flex items-center justify-center",
        className,
      )}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 80"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="builtGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* The Path itself (The Ghost Bridge) */}
        <path
          d={`M ${startPoint.x} ${startPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${endPoint.x} ${endPoint.y}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-muted-foreground/10"
          strokeDasharray="4 4"
        />

        {/* Planks */}
        {planks.map(({ index, x, y, angle }) => {
          const isBuilt = index < planksBuiltCount;
          const isCurrent = index === planksBuiltCount - 1 && isBuilt;

          return (
            <g
              key={index}
              style={{
                transformOrigin: `${x}px ${y}px`,
                transform: `rotate(${angle}deg)`,
              }}
              className="transition-all duration-700 ease-in-out"
            >
              {/* Plank Shadow/Glow */}
              {isBuilt && (
                <rect
                  x={x - 7}
                  y={y - 2.5}
                  width="14"
                  height="5"
                  rx="2.5"
                  className={cn(
                    "fill-primary/20 blur-[2px]",
                    isCurrent && "animate-pulse fill-primary/40"
                  )}
                />
              )}

              {/* Main Plank */}
              <rect
                x={x - 6}
                y={y - 1.5}
                width="12"
                height="3"
                rx="1.5"
                className={cn(
                  "transition-all duration-700 ease-out",
                  isBuilt
                    ? "fill-primary"
                    : "fill-muted-foreground/10",
                  isCurrent && "stroke-white/20 stroke-1"
                )}
                style={{
                  ...(isBuilt ? { fill: "url(#builtGradient)" } : {}),
                  ...(isCurrent ? { filter: "url(#glow)" } : {})
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
