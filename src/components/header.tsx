import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <Logo className="h-8 w-8" />
          <span className="text-xl font-headline font-bold">کتابچی</span>
        </Link>
        <nav className="ms-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/trips">من مسافر هستم</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/requests">من درخواست کتاب دارم</Link>
          </Button>
        </nav>
        <div className="ms-auto md:ms-4 flex items-center gap-2">
            <div className="h-6 w-px bg-border hidden md:block" />
            <Button variant="outline" asChild>
                <Link href="/login">ورود / ثبت‌نام</Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
