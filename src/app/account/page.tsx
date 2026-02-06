"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../loading";
import { UserData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must not be longer than 50 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } =
    useDoc<UserData>(userDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userData) {
      form.reset({
        displayName: userData.displayName || "",
      });
    }
  }, [userData, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!userDocRef) return;
    setIsSubmitting(true);
    updateDocumentNonBlocking(userDocRef, { displayName: data.displayName });
    toast({
      title: "Profile Updated",
      description: "Your display name has been successfully updated.",
    });
    setIsSubmitting(false);
  }

  const isLoading = isUserLoading || isUserDataLoading;

  if (isLoading || !userData) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

      <main className="container mx-auto px-6 py-12 md:py-24 relative z-10">
        <div className="mb-16 animate-reveal">
          <div className="flex items-center gap-3 text-primary mb-4">
            <div className="h-px w-8 bg-primary/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Oracle Configuration</span>
          </div>
          <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]">
            Account <span className="text-gradient">Matrix</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground/60 font-light italic mt-6 border-l-2 border-primary/20 pl-8 py-2">
            &quot;Your identity is the foundation of your strategic manifestation.&quot;
          </p>
        </div>

        <Card className="max-w-3xl glass-card border-white/5 shadow-2xl overflow-hidden rounded-[2.5rem] animate-reveal delay-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -z-10" />

          <CardHeader className="p-10 pb-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
            <CardTitle className="text-3xl font-headline font-bold tracking-tighter">Identity Profile</CardTitle>
            <CardDescription className="text-lg text-muted-foreground/60 font-light pt-2">
              Manage the core metadata of your manifestation entity.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-10 space-y-10">
            <div className="p-8 rounded-[1.5rem] bg-white/[0.03] border border-white/5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
                Neural Identifier (Email)
              </p>
              <p className="text-xl font-light text-white font-mono">{user?.email}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-xl font-bold tracking-tight">Public Codename</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Designate yourself..."
                          {...field}
                          className="h-16 rounded-2xl glass border-white/10 text-xl px-8 focus-visible:ring-primary/40 bg-white/2 font-light transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.formState.isDirty}
                    className={cn(
                      "h-16 px-12 rounded-2xl font-black text-lg uppercase tracking-widest transition-all duration-500",
                      form.formState.isDirty
                        ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95"
                        : "bg-white/5 text-muted-foreground/40 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    )}
                    {form.formState.isDirty ? "Commit Changes" : "Protocol Current"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

