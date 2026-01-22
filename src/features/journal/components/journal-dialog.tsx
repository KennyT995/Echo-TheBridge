import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Moon, Sparkles } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface JournalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function JournalDialog({ open, onOpenChange }: JournalDialogProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [entry, setEntry] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!user || !firestore || !entry.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(firestore, 'users', user.uid, 'daily_logs'), {
                content: entry,
                createdAt: serverTimestamp(),
                type: 'evening_reflection'
            });

            toast({
                title: "Reflection Saved",
                description: "Your insights have been captured. Rest well.",
            });

            setEntry("");
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving journal:", error);
            toast({
                title: "Error",
                description: "Failed to save your reflection. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-indigo-500 mb-2">
                        <Moon className="w-5 h-5" />
                        <span className="text-sm font-medium uppercase tracking-wider">Evening Reflection</span>
                    </div>
                    <DialogTitle>Close out your day</DialogTitle>
                    <DialogDescription>
                        Take a moment to reflect. What went well? What did you learn?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="journal-entry">Your Thoughts</Label>
                        <Textarea
                            id="journal-entry"
                            placeholder="Today was..."
                            className="min-h-[150px] resize-none focus-visible:ring-indigo-500"
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground flex gap-2">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-yellow-500" />
                        <p>Your AI Coach will analyze this reflection to provide better guidance in tomorrow&apos;s morning briefing.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!entry.trim() || isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Reflection"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
