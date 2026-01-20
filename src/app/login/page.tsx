'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth, useUser } from '@/firebase';
import {
  signInWithEmail,
  signUpWithEmail,
} from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-utils';


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState<'login' | 'signup' | null>(null);


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);



  // ... (inside component)

  const handleAuthError = (error: unknown) => {
    let message = getErrorMessage(error);

    // Map Firebase error codes if possible
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = (error as any).code;
      switch (code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Incorrect password or email. Please try again.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email.';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Try logging in instead.';
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
      if (action === 'login') {
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
        <Loader2 className="h-16 w-16 animate-spin text-primary" suppressHydrationWarning />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className={cn("w-full max-w-sm transition-opacity", isUserLoading && "opacity-50")}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Enter your details to create an account or log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        {...field}
                        type="email"
                        disabled={isSubmitting || isUserLoading}
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
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={isSubmitting || isUserLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-4 pt-2">
                <Button
                  onClick={() => setActiveAction('signup')}
                  type="submit"
                  disabled={isSubmitting || isUserLoading}
                  className="w-full"
                >
                  {(isSubmitting && activeAction === 'signup') || isUserLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Already have an account?
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveAction('login')}
                  type="submit"
                  disabled={isSubmitting || isUserLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {(isSubmitting && activeAction === 'login') || isUserLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
