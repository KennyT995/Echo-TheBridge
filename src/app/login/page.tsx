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
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    if (user) {
      router.push('/');
    }
  }, [user, router]);


  const onSubmit = (values: LoginFormValues, action: 'login' | 'signup') => {
    setIsSubmitting(true);
    setActiveAction(action);

    try {
      if (action === 'login') {
        initiateEmailSignIn(auth, values.email, values.password);
      } else {
        initiateEmailSignUp(auth, values.email, values.password);
      }
      // Non-blocking, so we don't await. Redirection is handled by the effect above.
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message,
        });
        setIsSubmitting(false);
        setActiveAction(null);
    }
  };


  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account or sign up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => e.preventDefault()}
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
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={form.handleSubmit((values) => onSubmit(values, 'login'))}
                  disabled={isSubmitting}
                  variant="outline"
                >
                  {isSubmitting && activeAction === 'login' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
                <Button
                  onClick={form.handleSubmit((values) => onSubmit(values, 'signup'))}
                  disabled={isSubmitting}
                >
                  {isSubmitting && activeAction === 'signup' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
