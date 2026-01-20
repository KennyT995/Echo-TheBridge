import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil } from 'lucide-react';
import { z } from 'zod';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { visionCategories } from '@/features/visions/types';

const EditVisionSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    category: z.enum(visionCategories).or(z.literal('')),
});

interface EditVisionDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialTitle: string;
    initialCategory: string;
    onUpdate: (title: string, category: string) => Promise<void>;
}

export function EditVisionDialog({
    isOpen,
    onOpenChange,
    initialTitle,
    initialCategory,
    onUpdate,
}: EditVisionDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Fallback map for category descriptions since we want to reuse the nice UI
    const categoryDescriptions: Record<string, string> = {
        'Career': 'Professional growth & success',
        'Health': 'Physical & mental well-being',
        'Financial': 'Wealth, savings & stability',
        'Personal Growth': 'Skills, hobbies & self',
        'Relationships': 'Family, friends & connections',
        'Legacy': 'Impact, contribution & memory',
    };

    const form = useForm<z.infer<typeof EditVisionSchema>>({
        resolver: zodResolver(EditVisionSchema),
        defaultValues: {
            title: initialTitle,
            category: initialCategory as any,
        },
    });

    const onSubmit = async (values: z.infer<typeof EditVisionSchema>) => {
        setIsLoading(true);
        await onUpdate(values.title, values.category);
        setIsLoading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Vision Details</DialogTitle>
                    <DialogDescription>
                        Update the title and category of your vision.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vision Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
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
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                        >
                                            {visionCategories.map((category) => (
                                                <div key={category}>
                                                    <RadioGroupItem
                                                        value={category}
                                                        id={`edit-${category}`}
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={`edit-${category}`}
                                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center h-full transition-all"
                                                    >
                                                        <span className="font-semibold">{category}</span>
                                                        <span className="text-xs text-muted-foreground mt-1">
                                                            {categoryDescriptions[category]}
                                                        </span>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
