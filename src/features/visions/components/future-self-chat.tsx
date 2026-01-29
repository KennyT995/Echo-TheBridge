import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Sparkles, User, Loader2, X } from "lucide-react";
import { getFutureSelfChat } from "@/app/actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  role: "user" | "model";
  content: string;
}

interface FutureSelfChatProps {
  userName?: string | null;
  visionTitle: string;
  visionGoal: string;
  className?: string;
  aiFeaturesEnabled: boolean;
}

export function FutureSelfChat({
  userName,
  visionTitle,
  visionGoal,
  className,
  aiFeaturesEnabled,
}: FutureSelfChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const result = await getFutureSelfChat({
      userName: userName || "Visionary",
      visionTitle,
      visionGoal,
      userMessage: userMsg,
      conversationHistory: messages,
    });

    setIsLoading(false);

    if (result.response) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: result.response!.response },
      ]);
    } else {
      // Handle error gracefully in UI
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "I'm having trouble connecting across time right now. Try again in a moment.",
        },
      ]);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white p-0 z-50",
          className,
        )}
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] shadow-2xl flex flex-col z-50 border-indigo-200 dark:border-indigo-800",
        className,
      )}
    >
      <CardHeader className="bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" /> Future{" "}
              {userName?.split(" ")[0] || "You"}
            </CardTitle>
            <CardDescription className="text-xs">
              Speaking from a future where &quot;{visionTitle}&quot; is reality.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2 -mt-2"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!aiFeaturesEnabled ? (
        <CardContent className="flex-1 p-4 flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-indigo-100 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="font-bold mb-2">Speak With Your Future Self</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This is a premium feature. Upgrade to the Pathfinder plan or higher
            to get advice from the version of you that has already achieved this
            vision.
          </p>
          <Button asChild>
            <Link href="/plans">Upgrade Your Plan</Link>
          </Button>
        </CardContent>
      ) : (
        <>
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            <ScrollArea className="h-full p-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-20 px-6">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-indigo-200" />
                  <p className="text-sm">
                    I am you, 5 years from now. I know what you&apos;re going
                    through, and I know we make it. What&apos;s on your mind?
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 pb-4">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-3",
                      m.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {m.role === "user" ? (
                        <>
                          <AvatarImage src="" />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback className="bg-indigo-100 text-indigo-600">
                          <Sparkles className="w-4 h-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg p-3 text-sm max-w-[80%]",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        <Sparkles className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t border-border bg-background/50">
            <form
              className="flex w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                placeholder="Message your future self..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
