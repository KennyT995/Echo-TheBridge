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
        <Card className="glass shadow-2xl border-white/5 rounded-[2.5rem] overflow-hidden group animate-reveal">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full -z-10 group-hover:bg-primary/10 transition-all" />

            <CardHeader className="p-8 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl font-headline font-bold tracking-tight">
                    <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                        <Sparkles className="text-primary h-5 w-5 animate-pulse" />
                    </div>
                    Strategic <span className="text-gradient">Inspiration</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-8">
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Enter Conceptual Anchors</Label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input
                            placeholder="e.g., neural, legacy, transcendence"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            disabled={isLoading}
                            className="h-14 rounded-2xl glass border-white/10 text-lg px-6 focus-visible:ring-primary/40 bg-white/5 font-light"
                        />
                        <Button
                            onClick={handleGenerateIdeas}
                            disabled={isLoading || !keywords}
                            type="button"
                            className="h-14 px-8 rounded-2xl bg-foreground text-background font-bold hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Inspire Me"}
                        </Button>
                    </div>
                </div>
                {error && (
                    <Alert variant="destructive" className="bg-destructive/5 border-destructive/10 rounded-[1.25rem]">
                        <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
                    </Alert>
                )}
                {ideas.length > 0 && (
                    <div className="space-y-6 animate-reveal">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 border-b border-primary/10 pb-4">
                            Generated Trajectories
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            {ideas.map((idea, index) => (
                                <button
                                    key={index}
                                    className="text-left p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-primary/20 transition-all text-lg group/item relative overflow-hidden"
                                    onClick={() => onSelectIdea(idea)}
                                    type="button"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/item:bg-primary transition-all" />
                                    <span className="group-hover/item:text-primary transition-colors font-light leading-relaxed italic block pl-2">
                                        &quot;{idea}&quot;
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
