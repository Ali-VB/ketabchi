import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">ایجاد حساب کاربری</CardTitle>
          <CardDescription>به کتابچی بپیوندید. دنیایی از کتاب در انتظار شماست.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">نام و نام خانوادگی</Label>
              <Input id="name" type="text" placeholder="مثال: سیمین دانشور" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" type="email" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              ثبت‌نام
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              وارد شوید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
