'use client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Package, Plane, Send, Users } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { Badge } from './ui/badge';
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

interface TripCardProps {
  trip: Trip;
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

const getTripMatchText = (count: number) => {
  if (count === 1) return 'یک درخواست با این سفر منطبق است';
  const countInPersian = new Intl.NumberFormat('fa-IR').format(count);
  return `${countInPersian} درخواست با این سفر منطبق است`;
};

export function TripCard({ trip, showFooter = true, matchCount }: TripCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSendMessage = () => {
    if (!user) {
      setIsDialogOpen(true);
    } else {
      router.push(`/dashboard/messages?recipient=${trip.userId}`);
    }
  };

  const redirectUrl = encodeURIComponent('/dashboard/requests?action=new');

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <CardContent className="flex flex-1 flex-col space-y-3 p-4">
          <div className="flex-1 space-y-3">
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              اعلام سفر
            </Badge>
            <div className="space-y-2 pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                <span className="font-semibold text-foreground">
                  {trip.from_city}
                  <span className="mx-1 font-normal text-muted-foreground">
                    →
                  </span>
                  {trip.to_city}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-1 h-4 w-4 shrink-0" />
                <div>
                  <span>تاریخ:</span>
                  <p className="font-semibold text-foreground">
                    {`${formatPersianDate(trip.date_start)} تا ${formatPersianDate(
                      trip.date_end
                    )}`}
                  </p>
                  <p className="text-xs">
                    {`${formatGregorianDate(
                      trip.date_start
                    )} to ${formatGregorianDate(trip.date_end)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>ظرفیت: {trip.capacity} کیلوگرم</span>
              </div>
            </div>
          </div>
          {matchCount && matchCount > 0 && (
            <Link href="/dashboard/matches" className="block pt-2">
              <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive transition-colors hover:bg-destructive/20">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{getTripMatchText(matchCount)}</span>
              </div>
            </Link>
          )}
        </CardContent>
        {showFooter && (
          <CardFooter className="flex items-center justify-between border-t bg-accent/10 p-4">
            <span className="text-sm font-medium">{trip.user.name}</span>
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
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>برای ادامه وارد شوید</DialogTitle>
            <DialogDescription>
              برای ارسال پیام و هماهنگی، ابتدا باید وارد حساب کاربری خود شوید یا
              یک حساب جدید بسازید. پس از آن با درخواست کتاب میتوانید پیام خود را
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
