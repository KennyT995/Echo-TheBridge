'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Zap, Sparkles } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';

import { Label } from '@/components/ui/label';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { generateRoadmap, getVisionIdeas, analyzeVision } from '@/app/actions';
import { VisionFormSchema, type VisionFormValues, visionCategories, type VisionCategory } from '@/lib/types';
import { VisionConfirmationDialog } from './vision-confirmation-dialog';

import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface VisionAnalysis {
    isMultiVision: boolean;
    reasoning: string;
    unifiedVision: {
        title: string;
        goal: string;
        category: VisionCategory;
        reasoning?: string;
    };
    proposedVisions: Array<{
        title: string;
        goal: string;
        category: VisionCategory;
        reasoning?: string;
    }>;
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

    const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Helper to actually create a vision
    const createVision = async (data: VisionFormValues) => {
        if (!user) return;
        setIsLoading(true);
        // Ensure category is set (fallback for manual 'keep together')
        const finalData = { ...data };
        if (!finalData.category) {
            // This should be theoretically populated by AI, but as a fallback
            finalData.category = 'Personal Growth';
        }

        const result = await generateRoadmap(finalData);

        if (result.error || !result.roadmap || !result.correctedGoal) {
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
            ...finalData,
            goal: result.correctedGoal,
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

        toast({
            title: "Vision Created",
            description: `"${finalData.title}" is ready.`,
        });

        return visionId;
    };

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

        // Step 1: Analyze Intent
        const analysisResult = await analyzeVision(values.goal);

        if ('error' in analysisResult) {
            // Fallback to normal flow if analysis fails
            console.error(analysisResult.error);
            await createVision(values);
            // We will handle the "one vision" case immediately below via existing prop
            if (onVisionCreated) onVisionCreated('fallback');
        } else {
            setAnalysis(analysisResult as unknown as VisionAnalysis);
            if (analysisResult.isMultiVision) {
                setIsLoading(false);
                setIsConfirmOpen(true);
                return; // Stop here and wait for dialog
            } else {
                // Auto-inject inferred category if missing
                if (!values.category && analysisResult.unifiedVision.category) {
                    // We need to match the enum
                    const category = analysisResult.unifiedVision.category as VisionCategory;
                    form.setValue('category', category);
                    values.category = category;
                }
                // Auto-inject title if missing
                if (!values.title && analysisResult.unifiedVision.title) {
                    form.setValue('title', analysisResult.unifiedVision.title);
                    values.title = analysisResult.unifiedVision.title;
                }
            }
        }

        // Proceed to creation (Unified or Single Normal)
        const vid = await createVision(values);
        if (vid) onVisionCreated(vid);
        setIsLoading(false);
    }

    const handleConfirmUnified = async () => {
        setIsConfirmOpen(false);
        setIsLoading(true);
        if (analysis?.unifiedVision) {
            form.setValue('title', analysis.unifiedVision.title);
            form.setValue('category', analysis.unifiedVision.category);
            const values = form.getValues(); // Get the updated values
            const vid = await createVision(values);
            if (vid) onVisionCreated(vid);
        }
        setIsLoading(false);
    };

    const handleConfirmSeparate = async () => {
        setIsConfirmOpen(false);
        setIsLoading(true);

        if (analysis?.proposedVisions) {
            for (const vision of analysis.proposedVisions) {
                await createVision({
                    title: vision.title,
                    goal: vision.goal,
                    category: vision.category,
                    isPublic: false
                });
            }
            toast({
                title: "Multiple Visions Created",
                description: "We've created separate roadmaps for your goals.",
            });
            onVisionCreated('dashboard');
        }
        setIsLoading(false);
    };

    if (isConfirmOpen && analysis) {
        return (
            <VisionConfirmationDialog
                analysis={analysis}
                onConfirmUnified={handleConfirmUnified}
                onConfirmSeparate={handleConfirmSeparate}
                isCreating={isLoading}
                onCancel={() => setIsConfirmOpen(false)}
            />
        );
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
                                    <RadioGroup
                                        onValueChange={(val) => {
                                            if (val === 'auto') {
                                                field.onChange(''); // Clear value for auto-detect
                                            } else {
                                                field.onChange(val);
                                            }
                                        }}
                                        defaultValue={field.value || 'auto'}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {/* Explicit "Let AI Pick" Option */}
                                        <div className="col-span-2">
                                            <RadioGroupItem value="auto" id="auto-pick" className="peer sr-only" />
                                            <Label
                                                htmlFor="auto-pick"
                                                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full transition-all"
                                            >
                                                <span className="font-bold text-lg flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    Let AI Decide based on my goal
                                                </span>
                                            </Label>
                                        </div>

                                        {visionCategories.map((category) => (
                                            <div key={category}>
                                                <RadioGroupItem
                                                    value={category}
                                                    id={category}
                                                    className="peer sr-only"
                                                />
                                                <Label
                                                    htmlFor={category}
                                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full transition-all"
                                                >
                                                    <span className="font-semibold">{category}</span>
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {category === 'Career' && 'Professional growth & success'}
                                                        {category === 'Health' && 'Physical & mental well-being'}
                                                        {category === 'Financial' && 'Wealth, savings & stability'}
                                                        {category === 'Personal Growth' && 'Skills, hobbies & self'}
                                                        {category === 'Relationships' && 'Family, friends & connections'}
                                                        {category === 'Legacy' && 'Impact, contribution & memory'}
                                                    </span>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
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
                                        placeholder="Describe your vision in detail. What do you want to achieve? When do you want to achieve it by? (e.g., 'in 3 months', 'by next summer'). The more specific you are about the 'what' and 'when', the better the AI roadmap will be."
                                        rows={15}
                                        className="h-[400px] resize-none bg-background text-foreground text-base"
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
