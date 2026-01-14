'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Zap, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { generateRoadmap } from '@/app/actions';
import { VisionFormSchema, type VisionFormValues, type Roadmap } from '@/lib/types';
import { RoadmapDisplay } from './roadmap-display';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type VisionHorizon = 'twoYearVision' | 'fiveYearVision' | 'tenYearVision';
const visionHorizons: { id: VisionHorizon; label: string; description: string }[] = [
  { id: 'twoYearVision', label: '2 Years', description: 'Short-term goals. What do you want to achieve soon?' },
  { id: 'fiveYearVision', label: '5 Years', description: 'Mid-term ambitions. Where do you see yourself in the medium term?' },
  { id: 'tenYearVision', label: '10 Years', description: 'Long-term aspirations. What is your ultimate legacy?' },
];

type VisionCategory = 'career' | 'health' | 'relationships' | 'legacy';
const visionCategories: { id: VisionCategory; label: string; placeholder: string }[] = [
  { id: 'career', label: 'Career', placeholder: 'e.g., "Become a senior software engineer at a top tech company."' },
  { id: 'health', label: 'Health', placeholder: 'e.g., "Run a half-marathon and meal prep consistently."' },
  { id: 'relationships', label: 'Relationships', placeholder: 'e.g., "Nurture deeper connections with my family and friends."' },
  { id: 'legacy', label: 'Legacy', placeholder: 'e.g., "Mentor young developers and contribute to open-source projects."' },
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
      <Card className="bg-card/80 backdrop-blur-lg border-white/10">
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Accordion type="multiple" defaultValue={['twoYearVision']} className="w-full space-y-4">
                {visionHorizons.map((horizon) => (
                  <AccordionItem key={horizon.id} value={horizon.id} className="border-border/50 rounded-lg bg-secondary/30">
                    <AccordionTrigger className="p-4 text-lg font-medium text-primary/90 hover:text-primary hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        <span>{horizon.label}</span>
                         <p className="text-sm font-normal text-muted-foreground">{horizon.description}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {visionCategories.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name={`${horizon.id}.${category.id}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2 mb-2 text-foreground/80">
                                  <Sparkles className="h-4 w-4 text-accent"/>
                                  {category.label}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={category.placeholder}
                                    className="min-h-[120px] resize-none bg-background/80 text-base"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
