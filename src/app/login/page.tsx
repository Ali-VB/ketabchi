'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ToastAction } from '@/components/ui/toast';

const formSchema = z.object({
  email: z.string().email({ message: 'لطفاً یک ایمیل معتبر وارد کنید.' }),
  password: z.string().min(1, { message: 'رمز عبور نمی‌تواند خالی باشد.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      if (!userCredential.user.emailVerified) {
        await signOut(auth); // Sign out the user
        toast({
          variant: 'destructive',
          title: 'ایمیل تایید نشده',
          description: 'لطفاً ایمیل خود را تایید کنید تا بتوانید وارد شوید.',
          action: <ToastAction altText="ارسال مجدد ایمیل" onClick={async () => {
              try {
                await sendEmailVerification(userCredential.user);
                toast({ title: 'موفق', description: 'ایمیل تایید مجددا ارسال شد.' });
              } catch (e) {
                toast({ variant: 'destructive', title: 'خطا', description: 'خطا در ارسال مجدد ایمیل.' });
              }
          }}>ارسال مجدد ایمیل</ToastAction>
        });
        setIsLoading(false);
        return;
      }
      
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/dashboard');
    } catch (error: any) {
      console.error('Firebase login error:', error);
      let description = 'مشکلی در هنگام ورود پیش آمد. لطفا دوباره تلاش کنید.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = 'ایمیل یا رمز عبور اشتباه است.';
      } else if (error.code === 'auth/invalid-email') {
        description = 'فرمت ایمیل وارد شده معتبر نیست.';
      } else if (error.code === 'auth/network-request-failed') {
        description = 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
      }

      toast({
        variant: 'destructive',
        title: 'خطا در ورود',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4">
            <Logo className="h-12 w-12" />
          </Link>
          <CardTitle className="text-3xl font-headline">ورود به کتابچی</CardTitle>
          <CardDescription>برای ادامه، ایمیل و رمز عبور خود را وارد کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
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
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                ورود
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            حساب کاربری ندارید؟{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              ثبت‌نام کنید
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4 text-center text-sm">
        <Link href="/" className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
