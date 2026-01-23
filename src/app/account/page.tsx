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
    <main className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-8">
        My Account
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your account details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-md bg-muted/50 p-3">
            <p className="text-sm font-medium text-muted-foreground">
              Email Address
            </p>
            <p className="text-sm">{user?.email}</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isDirty}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isDirty ? "Save Changes" : "Saved"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
