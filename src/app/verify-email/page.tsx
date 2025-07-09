'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <MailCheck className="mx-auto h-16 w-16 text-green-500" />
                    <CardTitle className="mt-4 text-3xl font-headline">حساب کاربری خود را تایید کنید</CardTitle>
                    <CardDescription className="pt-2">
                        یک ایمیل تایید به <span className="font-bold text-primary">{email || 'آدرس ایمیل شما'}</span> ارسال شد.
                        <br />
                        لطفا برای فعال‌سازی حساب خود روی لینک موجود در ایمیل کلیک کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p className="text-sm text-muted-foreground">ایمیل را دریافت نکرده‌اید؟ پوشه اسپم خود را بررسی کنید یا از صفحه ورود دوباره درخواست ارسال کنید.</p>
                    <Button asChild className="w-full">
                        <Link href="/login">بازگشت به صفحه ورود</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
