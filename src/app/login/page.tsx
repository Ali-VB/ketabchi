import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">ورود به کتابچی</CardTitle>
          <CardDescription>برای ادامه، ایمیل و رمز عبور خود را وارد کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" type="email" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              ورود
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            حساب کاربری ندارید؟{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              ثبت‌نام کنید
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
