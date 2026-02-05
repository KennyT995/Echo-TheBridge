"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getVisionIdeas } from "@/app/actions";

interface VisionInspirationProps {
    onSelectIdea: (idea: string) => void;
}

export function VisionInspiration({ onSelectIdea }: VisionInspirationProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [keywords, setKeywords] = useState("");
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
                        <Button
                            onClick={handleGenerateIdeas}
                            disabled={isLoading || !keywords}
                            type="button"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Inspire Me"}
                        </Button>
                    </div>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {ideas.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Potential Paths
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {ideas.map((idea, index) => (
                                <button
                                    key={index}
                                    className="text-left p-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all text-sm group"
                                    onClick={() => onSelectIdea(idea)}
                                    type="button"
                                >
                                    <span className="group-hover:text-primary transition-colors">{idea}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
