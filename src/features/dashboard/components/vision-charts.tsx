'use client';

import { useMemo } from 'react';
import type { Vision, Roadmap, RoadmapItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { visionCategories } from '@/lib/types';

interface VisionChartsProps {
  visions: Vision[];
  roadmaps: Record<string, Roadmap>;
}

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(180, 70%, 50%)'
];

function calculateOverallProgress(roadmap: Roadmap): number {
    const allItems: RoadmapItem[] = [
        ...(roadmap.dailyHabits || []),
        ...(roadmap.weeklyTactics || []),
        ...(roadmap.monthlySprints || []),
        ...(roadmap.yearlyMilestones || []),
    ];
    if (allItems.length === 0) return 0;
    const completedItems = allItems.filter(item => item.completed).length;
    return (completedItems / allItems.length) * 100;
}


export function VisionCharts({ visions, roadmaps }: VisionChartsProps) {
  const categoryDistribution = useMemo(() => {
    return visionCategories.map(category => ({
      name: category,
      count: visions.filter(v => v.category === category).length,
    })).filter(c => c.count > 0);
  }, [visions]);

  const categoryProgress = useMemo(() => {
    return visionCategories.map(category => {
        const relevantVisions = visions.filter(v => v.category === category);
        if (relevantVisions.length === 0) {
            return { name: category, progress: 0 };
        }
        const totalProgress = relevantVisions.reduce((sum, vision) => {
            const roadmap = roadmaps[vision.id];
            return sum + (roadmap ? calculateOverallProgress(roadmap) : 0);
        }, 0);
        return {
            name: category,
            progress: totalProgress / relevantVisions.length,
        };
    }).filter(c => c.progress > 0);
  }, [visions, roadmaps]);

  if (visions.length === 0) {
    return null;
  }

  const pieChartConfig = useMemo(() => {
    return categoryDistribution.reduce((acc, category, index) => {
        acc[category.name] = {
            label: category.name,
            color: chartColors[index % chartColors.length]
        };
        return acc;
    }, {});
  }, [categoryDistribution]);

  return (
    <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">Progress Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Vision Distribution</CardTitle>
                    <CardDescription>How your visions are spread across different life areas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
                         <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                            <Pie data={categoryDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                                {categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartTooltipContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Progress by Category</CardTitle>
                    <CardDescription>Average completion rate for each vision category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{
                         progress: {
                            label: 'Progress',
                            color: 'hsl(var(--chart-1))',
                        },
                    }} className="h-[250px] w-full">
                        <BarChart data={categoryProgress} layout="vertical" margin={{ left: 10 }}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" dataKey="progress" unit="%" hide />
                            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={80} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" labelKey="name" />}
                            />
                            <Bar dataKey="progress" radius={5}>
                                {categoryProgress.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
