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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUserProfileDocument } from '@/lib/firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'نام باید حداقل ۲ حرف داشته باشد.' }),
  email: z.string().email({ message: 'لطفاً یک ایمیل معتبر وارد کنید.' }),
  password: z.string().min(6, { message: 'رمز عبور باید حداقل ۶ حرف داشته باشد.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: values.name,
        });
        await createUserProfileDocument(userCredential.user);
      }
      router.push('/role-selection');
    } catch (error: any) {
      console.error("Firebase signup error:", error);
      let description = 'مشکلی پیش آمد. لطفا دوباره تلاش کنید.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          description = 'این ایمیل قبلا استفاده شده است.';
          break;
        case 'auth/invalid-email':
          description = 'لطفاً یک ایمیل معتبر وارد کنید.';
          break;
        case 'auth/weak-password':
          description = 'رمز عبور ضعیف است. باید حداقل ۶ حرف داشته باشد.';
          break;
        case 'auth/operation-not-allowed':
          description = 'ثبت‌نام با ایمیل/رمزعبور فعال نیست. لطفا تنظیمات فایربیس را بررسی کنید.';
          break;
      }
      toast({
        variant: 'destructive',
        title: 'خطا در ثبت‌نام',
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
          <CardTitle className="text-3xl font-headline">ایجاد حساب کاربری</CardTitle>
          <CardDescription>به کتابچی بپیوندید. دنیایی از کتاب در انتظار شماست.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: سیمین دانشور" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                ثبت‌نام
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              وارد شوید
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
