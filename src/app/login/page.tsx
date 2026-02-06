"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import {
  signInWithEmail,
  signUpWithEmail,
} from "@/firebase/non-blocking-login";
import { useRouter } from "next/navigation";
import { Loader2, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-utils";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState<"login" | "signup" | null>(
    null,
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);

  // ... (inside component)

  const handleAuthError = (error: unknown) => {
    let message = getErrorMessage(error);

    // Map Firebase error codes if possible
    if (typeof error === "object" && error !== null && "code" in error) {
      const code = (error as { code: string }).code;
      switch (code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          message = "Incorrect password or email. Please try again.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/email-already-in-use":
          message = "This email is already registered. Try logging in instead.";
          break;
      }
    }

    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: message,
    });
  };

  const onSubmit = async (values: LoginFormValues) => {
    const action = activeAction;
    if (!auth || !action) return;

    setIsSubmitting(true);

    try {
      if (action === "login") {
        await signInWithEmail(auth, values.email, values.password);
      } else {
        await signUpWithEmail(auth, values.email, values.password);
      }
      // On successful auth, the `useUser` hook will update, and the `useEffect`
      // will handle the redirection to the dashboard. We don't need to do anything else here.
    } catch (error: unknown) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false); // Only reset on error
      setActiveAction(null);
    }
  };

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2
          className="h-16 w-16 animate-spin text-primary"
          suppressHydrationWarning
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex items-center justify-center p-6">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-indigo-500/5 blur-[140px] rounded-full -z-10 animate-pulse delay-1000" />

      <Card
        className={cn(
          "w-full max-w-lg glass-card border-white/5 shadow-2xl overflow-hidden rounded-[3rem] animate-reveal transition-all duration-700",
          isUserLoading && "opacity-50 scale-95"
        )}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <CardHeader className="p-12 pb-6 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center justify-center mb-4 group">
            <Loader2 className={cn("h-10 w-10 text-primary transition-all duration-500", !isSubmitting ? "animate-pulse group-hover:scale-110" : "animate-spin")} />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">Authorization Protocol</span>
            <CardTitle className="text-5xl font-headline font-black tracking-tighter text-white">
              Initialize <span className="text-gradient">Access</span>
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground/40 font-light pt-2 italic">
              &quot;The bridge between vision and reality starts here.&quot;
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-12 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Neural Identifier (Email)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="designate@trajectory.com"
                        {...field}
                        type="email"
                        disabled={isSubmitting || isUserLoading}
                        className="h-16 rounded-[1.25rem] glass border-white/10 text-xl px-8 focus-visible:ring-primary/40 bg-white/2 font-light transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Security Key (Password)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={isSubmitting || isUserLoading}
                        className="h-16 rounded-[1.25rem] glass border-white/10 text-xl px-8 focus-visible:ring-primary/40 bg-white/2 font-light transition-all"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-6 pt-6">
                <Button
                  onClick={() => setActiveAction("signup")}
                  type="submit"
                  disabled={isSubmitting || isUserLoading}
                  className="h-16 rounded-[1.25rem] bg-white text-black hover:bg-white/90 font-black text-xl uppercase tracking-widest shadow-2xl transition-all active:scale-95 group"
                >
                  {(isSubmitting && activeAction === "signup") || isUserLoading ? (
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      Establish Matrix <Rocket className="ml-3 h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                    </span>
                  )}
                </Button>

                <div className="relative flex items-center justify-center py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                    <span className="bg-[#0b0b0b] px-6 text-muted-foreground/40">
                      Existential Verification
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveAction("login")}
                  type="submit"
                  disabled={isSubmitting || isUserLoading}
                  variant="ghost"
                  className="h-16 rounded-[1.25rem] border border-white/5 bg-white/2 text-white hover:bg-white/5 font-bold text-lg transition-all active:scale-95"
                >
                  {(isSubmitting && activeAction === "login") || isUserLoading ? (
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  ) : (
                    "Authorize Session"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

