'use client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Send, Users } from 'lucide-react';
import type { BookRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

interface RequestCardProps {
  request: BookRequest;
  showFooter?: boolean;
  matchCount?: number;
}

const formatPersianDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

const formatGregorianDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

const getRequestMatchText = (count: number) => {
  if (count === 1) return 'یک سفر با این درخواست منطبق است';
  const countInPersian = new Intl.NumberFormat('fa-IR').format(count);
  return `${countInPersian} سفر با این درخواست منطبق است`;
};


export function RequestCard({
  request,
  showFooter = true,
  matchCount,
}: RequestCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSendMessage = () => {
    if (!user) {
      setIsDialogOpen(true);
    } else {
      router.push(`/dashboard/messages?recipient=${request.userId}`);
    }
  };

  const redirectUrl = encodeURIComponent('/dashboard/trips?action=new');

  const isLegacy = !request.books || request.books.length === 0;

  const totalQuantity = isLegacy
    ? request.quantity || 1
    : request.books?.reduce((sum, book) => sum + book.quantity, 0) || 0;

  return (
    <>
      <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <CardContent className="flex flex-1 flex-col space-y-3 p-4">
          <div className="flex-1 space-y-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              درخواست کتاب
            </Badge>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-headline">
                {`درخواست برای ${totalQuantity} جلد کتاب`}
              </h2>
              {!isLegacy && request.books && request.books.length > 1 && (
                <p className="text-sm text-muted-foreground">
                  شامل {request.books.length} عنوان مختلف
                </p>
              )}
            </div>

            <div className="space-y-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  <span className="font-semibold text-foreground">
                    {request.from_city || 'مبدا نامشخص'}
                  </span>
                  <span className="mx-1 font-normal text-muted-foreground">
                    →
                  </span>
                  <span className="font-semibold text-foreground">
                    {request.to_city}
                  </span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-1 h-4 w-4 shrink-0" />
                <div>
                  <span>مهلت:</span>
                  <p className="font-semibold text-foreground">
                    {`${formatPersianDate(
                      request.deadline_start
                    )} تا ${formatPersianDate(request.deadline_end)}`}
                  </p>
                  <p className="text-xs">
                    {`${formatGregorianDate(
                      request.deadline_start
                    )} to ${formatGregorianDate(request.deadline_end)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        {showFooter && (
          <CardFooter className="flex items-center justify-between border-t bg-primary/10 p-4">
            <span className="text-sm font-medium">{request.user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleSendMessage}
            >
              <Send className="me-2 h-4 w-4" />
              ارسال پیام
            </Button>
          </CardFooter>
        )}
        {matchCount && matchCount > 0 && (
          <Link
            href="/dashboard/matches"
            className="group absolute inset-0 z-10 flex flex-col justify-end bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-black/60"
          >
            <div className="flex items-center gap-2 font-bold text-primary-foreground">
              <Users className="h-5 w-5 text-primary" />
              <p>{getRequestMatchText(matchCount)}</p>
            </div>
          </Link>
        )}
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>برای ادامه وارد شوید</DialogTitle>
            <DialogDescription>
              برای ارسال پیام و هماهنگی، ابتدا باید وارد حساب کاربری خود شوید یا
              یک حساب جدید بسازید. پس از آن با اعلام سفر میتوانید پیام خود را
              ارسال کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              انصراف
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/signup?redirect=${redirectUrl}`}>ثبت‌نام</Link>
            </Button>
            <Button asChild>
              <Link href={`/login?redirect=${redirectUrl}`}>ورود</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
