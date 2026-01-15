'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Zap, Sparkles } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateRoadmap, getVisionIdeas } from '@/app/actions';
import { VisionFormSchema, type VisionFormValues, visionCategories } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VisionFormProps {
    onVisionCreated: (visionId: string) => void;
}

function VisionInspiration({ onSelectIdea }: { onSelectIdea: (idea: string) => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [keywords, setKeywords] = useState('');
    const [ideas, setIdeas] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateIdeas = async () => {
        setIsLoading(true);
        setError(null);
        setIdeas([]);
        const result = await getVisionIdeas(keywords);
        if (result.error) {
            setError(result.error);
        } else if (result.ideas) {
            setIdeas(result.ideas);
        }
        setIsLoading(false);
    };

    return (
        <Card className="bg-muted/30 border-dashed border-primary/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="text-primary h-5 w-5" />
                    Need Inspiration?
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Enter some keywords</Label>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., technology, education, community"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button onClick={handleGenerateIdeas} disabled={isLoading || !keywords} type="button">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Inspire Me'}
                        </Button>
                    </div>
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {ideas.length > 0 && (
                     <div className="space-y-2">
                        <h4 className="font-medium">Here are a few ideas:</h4>
                        <ul className="space-y-2">
                            {ideas.map((idea, index) => (
                                <li key={index}>
                                    <Button variant="link" className="p-0 h-auto text-left whitespace-normal" onClick={() => onSelectIdea(idea)} type="button">
                                        {idea}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
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
      isPublic: false,
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
    
    onVisionCreated(visionId);
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <VisionInspiration onSelectIdea={(idea) => form.setValue('goal', idea)} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category for your vision" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {visionCategories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
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
    </div>
  );
}
