'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Zap } from 'lucide-react';
import { useUser } from '@/firebase';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateAndSaveRoadmap } from '@/app/actions';
import { VisionFormSchema, type VisionFormValues } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface VisionFormProps {
    onVisionCreated: (visionId: string) => void;
}

export function VisionForm({ onVisionCreated }: VisionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<VisionFormValues>({
    resolver: zodResolver(VisionFormSchema),
    defaultValues: {
      title: '',
      goal: '',
    },
  });

  async function onSubmit(values: VisionFormValues) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Authenticated',
            description: 'You must be logged in to create a vision.',
        });
        return;
    }
    setIsLoading(true);
    const result = await generateAndSaveRoadmap(values, user.uid);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Roadmap',
        description: result.error,
      });
    } else if (result.visionId) {
        onVisionCreated(result.visionId);
    }
    setIsLoading(false);
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-lg">Vision Title</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Launch a successful SaaS product" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-lg">Your Goal</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="Describe your vision in detail. What do you want to achieve? Why is it important to you? The more detail you provide, the better the AI-generated roadmap will be."
                            className="min-h-[200px] resize-none bg-background/80 text-base"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
          <div className="flex justify-center pt-4">
            <Button type="submit" size="lg" disabled={isLoading} className="font-bold">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Zap className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Architecting Your Future...' : 'Generate & Save'}
            </Button>
          </div>
        </form>
      </Form>
  );
}
