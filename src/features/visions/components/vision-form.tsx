'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Zap } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';

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
import { generateRoadmap } from '@/app/actions';
import { VisionFormSchema, type VisionFormValues } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


interface VisionFormProps {
    onVisionCreated: (visionId: string) => void;
}

export function VisionForm({ onVisionCreated }: VisionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

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
    
    // 1. Generate roadmap from the server action
    const result = await generateRoadmap(values);

    if (result.error || !result.roadmap) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Roadmap',
        description: result.error || 'An unknown error occurred.',
      });
      setIsLoading(false);
      return;
    }

    // 2. Save the vision and roadmap to Firestore from the client
    const visionId = nanoid();

    const visionData = {
      ...values,
      id: visionId,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    const roadmapData = {
      ...result.roadmap,
      id: visionId,
      visionId: visionId,
      userId: user.uid,
    };

    const visionRef = doc(firestore, 'users', user.uid, 'visions', visionId);
    setDocumentNonBlocking(visionRef, visionData, {});

    const roadmapRef = doc(firestore, 'users', user.uid, 'roadmaps', visionId);
    setDocumentNonBlocking(roadmapRef, roadmapData, {});
    
    // We don't wait for the writes to finish, we optimistically navigate.
    // The non-blocking writers will emit global errors if they fail.
    onVisionCreated(visionId);
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
