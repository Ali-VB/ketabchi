'use client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Package, Plane, Send, Users } from 'lucide-react';
import type { Trip, BookRequest } from '@/lib/types';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


interface TripCardProps {
  trip: Trip;
  showFooter?: boolean;
  matchCount?: number;
  matchingRequests?: BookRequest[];
  isDashboardView?: boolean;
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

export function TripCard({ trip, showFooter = true, matchCount, matchingRequests = [], isDashboardView = false }: TripCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState(false);
  const [isMatchesDialogOpen, setIsMatchesDialogOpen] = useState(false);

  const handleSendMessage = (recipientId: string) => {
    if (!user) {
      setIsSendMessageDialogOpen(true);
    } else {
      router.push(`/dashboard/messages?recipient=${recipientId}`);
    }
  };

  const redirectUrl = encodeURIComponent('/dashboard/requests?action=new');

  const MatchBadgeComponent = () => {
    if (!matchCount || matchCount === 0) return null;

    const badgeContent = (
      <div className="flex items-center gap-2 font-bold text-primary-foreground">
        <Users className="h-5 w-5 text-primary" />
        <p>{getTripMatchText(matchCount)}</p>
      </div>
    );
    
    if (isDashboardView) {
        return (
            <Dialog open={isMatchesDialogOpen} onOpenChange={setIsMatchesDialogOpen}>
                <DialogTrigger asChild>
                     <button className="group absolute inset-0 z-10 flex w-full flex-col justify-end bg-black/20 p-4 transition-all duration-300 hover:bg-black/30">
                        {badgeContent}
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>درخواست‌های منطبق با سفر شما</DialogTitle>
                        <DialogDescription>
                            این درخواست‌ها با سفر شما تطابق دارند. می‌توانید برای هماهنگی بیشتر به درخواست‌دهنده پیام دهید.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] space-y-4 overflow-y-auto p-1">
                        {matchingRequests.map(request => {
                           const totalQuantity = request.books?.reduce((sum, book) => sum + book.quantity, 0) || request.quantity || 0;
                           return (
                            <div key={request.id} className="flex items-center justify-between rounded-lg border p-4">
                               <div className="flex items-center gap-4">
                                 <Avatar>
                                    <AvatarImage src={request.user.photoURL ?? `https://placehold.co/40x40.png`} data-ai-hint="user portrait" />
                                    <AvatarFallback>{request.user.displayName?.charAt(0) || 'D'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <p className="font-semibold">{request.user.displayName || 'درخواست‌کننده بی‌نام'}</p>
                                      <p className="text-sm text-muted-foreground">درخواست برای {totalQuantity} جلد کتاب</p>
                                  </div>
                              </div>
                              <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendMessage(request.userId)}
                              >
                                  <Send className="me-2 h-4 w-4" />
                                  ارسال پیام
                              </Button>
                            </div>
                           )
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
      <Link
        href="/dashboard"
        className="group absolute inset-0 z-10 flex flex-col justify-end bg-black/20 p-4 transition-all duration-300 hover:bg-black/30"
      >
        {badgeContent}
      </Link>
    );
  }

  return (
    <>
      <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
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
                    {formatPersianDate(trip.trip_date)}
                  </p>
                  <p className="text-xs">
                    {formatGregorianDate(trip.trip_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>ظرفیت: {trip.capacity} کیلوگرم</span>
              </div>
            </div>
          </div>
        </CardContent>
        {showFooter && (
          <CardFooter className="flex items-center justify-between border-t bg-accent/10 p-4">
            <span className="text-sm font-medium">{trip.user.displayName || 'مسافر بی‌نام'}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => handleSendMessage(trip.userId)}
            >
              <Send className="me-2 h-4 w-4" />
              ارسال پیام
            </Button>
          </CardFooter>
        )}
        <MatchBadgeComponent />
      </Card>
      <Dialog open={isSendMessageDialogOpen} onOpenChange={setIsSendMessageDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsSendMessageDialogOpen(false)}>
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
