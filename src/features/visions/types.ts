import { z } from 'zod';

export const visionCategories = ["Career", "Health", "Financial", "Personal Growth", "Relationships", "Legacy"] as const;

export const VisionFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    goal: z.string().min(10, 'Your goal should be at least 10 characters long to provide enough context for the AI.'),
    category: z.enum(visionCategories).or(z.literal('')),
    isPublic: z.boolean().default(false),
});

export type VisionFormValues = z.infer<typeof VisionFormSchema>;

import { Timestamp, FieldValue } from 'firebase/firestore';

// ...

export interface Vision {
    id: string;
    userId: string;
    title: string;
    goal: string;
    category: z.infer<typeof VisionFormSchema.shape.category>;
    isPublic: boolean;
    createdAt: Timestamp | FieldValue;
}
