import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Package } from 'lucide-react';

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline">به کتابچی خوش آمدید!</h1>
        <p className="mt-2 text-lg text-muted-foreground">نقش اصلی خود را انتخاب کنید. بعداً می‌توانید آن را تغییر دهید.</p>
      </div>
      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <Link href="/dashboard" className="group">
          <Card className="h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary">
            <CardHeader className="items-center text-center">
              <Plane className="h-16 w-16 mb-4 text-primary transition-transform duration-300 group-hover:scale-110" />
              <CardTitle className="text-2xl font-headline">من مسافر هستم</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">سفرهای خود را اعلام کنید و به دیگران در رساندن کتاب‌هایشان کمک کنید.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard" className="group">
          <Card className="h-full transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-accent">
            <CardHeader className="items-center text-center">
              <Package className="h-16 w-16 mb-4 text-accent transition-transform duration-300 group-hover:scale-110" />
              <CardTitle className="text-2xl font-headline">من درخواست‌دهنده هستم</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">کتاب‌هایی که نیاز دارید را درخواست دهید تا مسافران برایتان بیاورند.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
