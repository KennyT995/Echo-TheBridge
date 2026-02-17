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
import { Send, Sparkles, User, Loader2, X, Minimize2, Radio, Wifi } from "lucide-react";
import { getFutureSelfChat } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import Link from "next/link";

interface Message {
  id: string;
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
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const simulateTyping = (text: string) => {
    setIsTyping(true);
    let i = 0;
    const typingId = Math.random().toString(36).substring(7);

    // Add an empty message for the AI that we will fill
    setMessages((prev) => [
      ...prev,
      { id: typingId, role: "model", content: "" },
    ]);

    const interval = setInterval(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === typingId
            ? { ...msg, content: text.slice(0, i + 1) }
            : msg
        )
      );
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15); // Fast typing speed
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), role: "user", content: userMsg },
    ]);
    setIsLoading(true);

    try {
      const result = await getFutureSelfChat({
        userName: userName || "Visionary",
        visionTitle,
        visionGoal,
        userMessage: userMsg,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
      });

      if (result.response) {
        setIsLoading(false);
        simulateTyping(result.response.response);
      } else {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: "error",
            role: "model",
            content: "Signal interference detected. Temporal link unstable. Please retry transmission.",
          },
        ]);
      }
    } catch {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          role: "model",
          content: "Critical system failure. Link terminated.",
        },
      ]);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-[0_0_40px_rgba(79,70,229,0.4)] bg-[#050505] border border-indigo-500/50 hover:bg-indigo-950/30 text-indigo-400 p-0 z-50 transition-all duration-500 hover:scale-110",
          className,
        )}
      >
        <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-20" />
        <div className="relative">
          <Radio className="w-8 h-8 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-black animate-bounce" />
        </div>
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 w-[90vw] sm:w-[450px] h-[600px] shadow-2xl flex flex-col z-50 border-indigo-500/30 bg-[#050505]/95 backdrop-blur-3xl overflow-hidden rounded-[2rem]",
        className,
      )}
    >
      {/* Neural Interface Header */}
      <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/20 p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-pulse" />

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-spin-slow" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center border border-indigo-500/50">
                <Wifi className="w-2.5 h-2.5 text-indigo-400" />
              </div>
            </div>
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-white font-headline tracking-wide">
                TEMPORAL LINK
              </CardTitle>
              <CardDescription className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Signal: Stable // {userName?.split(" ")[0] || "User"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Minimize link"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!aiFeaturesEnabled ? (
        <CardContent className="flex-1 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative z-10 space-y-6">
            <div className="p-4 bg-indigo-500/10 rounded-full mx-auto w-fit border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <Sparkles className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2 font-headline">Connection Restricted</h3>
              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-[250px] mx-auto">
                High-bandwidth temporal communication requires Level 2 clearance (Pathfinder Plan).
              </p>
            </div>
            <Button asChild className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
              <Link href="/plans">Initialize Upgrade</Link>
            </Button>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="flex-1 p-0 overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
            <div className="absolute inset-0 bg-[#050505]/95" /> {/* Overlay for darkness */}
            <ScrollArea className="h-full px-5 py-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[300px] text-center px-6 opacity-0 animate-reveal">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(99,102,241,0.1)]">
                    <Radio className="w-8 h-8 text-indigo-500/60" />
                  </div>
                  <p className="text-sm text-indigo-200/60 font-mono leading-relaxed mb-8">
                    &lt; SYSTEM: Temporal Bridge Established &gt;<br />
                    &lt; TARGET: Future Self [Status: Success] &gt;<br />
                    &lt; MSG: &quot;I am you, from the other side of the bridge. Ask me anything.&quot; &gt;
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-6 pb-4 relative z-10 w-full">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-4 max-w-[90%]",
                      m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <Avatar className={cn("h-8 w-8 shrink-0 border border-white/10 shadow-lg", m.role === "user" ? "bg-primary" : "bg-indigo-950")}>
                      {m.role === "user" ? (
                        <>
                          <AvatarImage src={user?.photoURL || ""} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                            {user?.displayName ? user.displayName.charAt(0) : "U"}
                          </AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback className="bg-indigo-950 text-indigo-400">
                          <Sparkles className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex flex-col gap-1 w-full min-w-0">
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-bold opacity-50 mb-0.5",
                        m.role === "user" ? "text-right" : "text-left"
                      )}>
                        {m.role === "user" ? "You" : "Future Self"}
                      </span>
                      <div
                        className={cn(
                          "rounded-2xl p-4 text-sm leading-relaxed shadow-lg backdrop-blur-md",
                          m.role === "user"
                            ? "bg-primary/20 text-white border border-primary/20 rounded-tr-sm"
                            : "bg-white/5 text-indigo-100 border border-indigo-500/20 rounded-tl-sm"
                        )}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4 max-w-[80%] mr-auto animate-pulse">
                    <Avatar className="h-8 w-8 shrink-0 border border-indigo-500/30 bg-indigo-950">
                      <AvatarFallback className="bg-indigo-950 text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1 h-10 px-4 bg-white/5 rounded-2xl border border-indigo-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={scrollRef} className="h-px w-full" />
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t border-indigo-500/20 bg-[#050505]/80 backdrop-blur-xl">
            <form
              className="flex w-full gap-3 items-end"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                placeholder="Transmit message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || isTyping}
                className="flex-1 bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500/50 min-h-[50px] rounded-xl"
              />
              <Button
                type="submit"
                size="icon"
                className="h-[50px] w-[50px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 shrink-0"
                disabled={isLoading || isTyping || !input.trim()}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
