'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { CalendarDays, Trophy, Target, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyRetroDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps = [
    {
        id: 'wins',
        title: 'Weekly Wins',
        description: 'What went well this week? Celebrate your progress.',
        icon: Trophy,
        placeholder: 'I finally completed the...'
    },
    {
        id: 'challenges',
        title: 'Challenges & Learnings',
        description: 'What got in the way? What did you learn?',
        icon: Target,
        placeholder: 'I struggled with...'
    },
    {
        id: 'next-week',
        title: 'Focus for Next Week',
        description: 'What is the ONE big thing you want to achieve next week?',
        icon: CalendarDays,
        placeholder: 'My main focus is...'
    }
];

export function WeeklyRetroDialog({ open, onOpenChange }: WeeklyRetroDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({
        wins: '',
        challenges: '',
        'next-week': ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user || !firestore) return;
        setIsSubmitting(true);

        try {
            await addDoc(collection(firestore, 'users', user.uid, 'daily_logs'), {
                type: 'weekly_retro',
                date: new Date().toISOString(),
                createdAt: serverTimestamp(),
                ...answers
            });

            toast({
                title: "Weekly Review Complete",
                description: "Your insights have been saved. Ready for a new week!",
            });

            onOpenChange(false);
            // Reset after close
            setTimeout(() => {
                setCurrentStep(0);
                setAnswers({ wins: '', challenges: '', 'next-week': '' });
            }, 500);

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save your review.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const StepIcon = steps[currentStep].icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <StepIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <DialogTitle>{steps[currentStep].title}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {steps[currentStep].description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <Textarea
                        value={answers[steps[currentStep].id]}
                        onChange={(e) => setAnswers({ ...answers, [steps[currentStep].id]: e.target.value })}
                        placeholder={steps[currentStep].placeholder}
                        className="min-h-[150px] resize-none text-base"
                        autoFocus
                    />

                    <div className="flex justify-center gap-1 mt-4">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentStep ? "w-8 bg-primary" : "w-1.5 bg-muted"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex-row justify-between sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0 || isSubmitting}
                    >
                        Back
                    </Button>
                    <Button onClick={handleNext} disabled={!answers[steps[currentStep].id] || isSubmitting}>
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {currentStep === steps.length - 1 ? 'Complete Review' : 'Next'}
                        {!isSubmitting && currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
