'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { generateRoadmap } from '@/app/actions';
import { VisionFormSchema, type VisionFormValues, type Roadmap } from '@/lib/types';
import { RoadmapDisplay } from './roadmap-display';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type VisionHorizon = 'twoYearVision' | 'fiveYearVision' | 'tenYearVision';
const visionHorizons: { id: VisionHorizon; label: string }[] = [
  { id: 'twoYearVision', label: '2 Years' },
  { id: 'fiveYearVision', label: '5 Years' },
  { id: 'tenYearVision', label: '10 Years' },
];

type VisionCategory = 'career' | 'health' | 'relationships' | 'legacy';
const visionCategories: { id: VisionCategory; label: string }[] = [
  { id: 'career', label: 'Career' },
  { id: 'health', label: 'Health' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'legacy', label: 'Legacy' },
];

export function VisionForm() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VisionFormValues>({
    resolver: zodResolver(VisionFormSchema),
    defaultValues: {
      twoYearVision: { career: '', health: '', relationships: '', legacy: '' },
      fiveYearVision: { career: '', health: '', relationships: '', legacy: '' },
      tenYearVision: { career: '', health: '', relationships: '', legacy: '' },
    },
  });

  async function onSubmit(values: VisionFormValues) {
    setIsLoading(true);
    setRoadmap(null);
    const result = await generateRoadmap(values);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Roadmap',
        description: result.error,
      });
    } else if (result.roadmap) {
      toast({
        title: 'Success!',
        description: 'Your new roadmap has been generated.',
      });
      setRoadmap(result.roadmap);
    }
    setIsLoading(false);
  }

  return (
    <div>
      <Card className="bg-[hsl(var(--card)/0.6)] backdrop-blur-xl border-[hsl(var(--border)/0.3)]">
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue={visionHorizons[0].id} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                  {visionHorizons.map((horizon) => (
                    <TabsTrigger key={horizon.id} value={horizon.id}>
                      {horizon.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {visionHorizons.map((horizon) => (
                  <TabsContent key={horizon.id} value={horizon.id} className="mt-6">
                    <Tabs defaultValue={visionCategories[0].id} className="w-full">
                      <TabsList variant="pills" className="grid w-full grid-cols-2 sm:grid-cols-4">
                        {visionCategories.map((category) => (
                          <TabsTrigger variant="pills" key={category.id} value={category.id}>
                            {category.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {visionCategories.map((category) => (
                        <TabsContent key={category.id} value={category.id} className="mt-4">
                          <FormField
                            control={form.control}
                            name={`${horizon.id}.${category.id}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">{`${horizon.label} ${category.label} Vision`}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={`My vision for my ${category.label.toLowerCase()} in ${horizon.label.toLowerCase()} is...`}
                                    className="min-h-[200px] resize-none bg-background/80 text-base"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </TabsContent>
                ))}
              </Tabs>
              <div className="flex justify-center">
                <Button type="submit" size="lg" disabled={isLoading} className="font-bold">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-5 w-5" />
                  )}
                  {isLoading ? 'Architecting Your Future...' : 'Generate Roadmap'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {roadmap && (
        <div className="mt-12 sm:mt-16">
          <div className="text-center mb-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Your Generated Roadmap
            </h2>
            <p className="mt-2 text-muted-foreground">Your dynamically generated path to achieving your vision.</p>
          </div>
          <RoadmapDisplay roadmap={roadmap} />
        </div>
      )}
    </div>
  );
}
