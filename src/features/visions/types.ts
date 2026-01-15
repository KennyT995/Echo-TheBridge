import { z } from 'zod';
import { serverTimestamp } from 'firebase/firestore';

export const VisionFormSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    goal: z.string().min(10, 'Your goal should be at least 10 characters long to provide enough context for the AI.'),
});

export type VisionFormValues = z.infer<typeof VisionFormSchema>;

export interface Vision {
    id: string;
    userId: string;
    title: string;
    goal: string;
    createdAt: any; // Timestamp or FieldValue
}
