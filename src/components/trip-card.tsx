'use client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Package, Plane, Send } from 'lucide-react';
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
}

const formatGregorianToPersian = (dateString: string) => {
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

export function TripCard({ trip }: TripCardProps) {
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
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full">
        <CardContent className="p-4 space-y-3 flex-1">
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            اعلام سفر
          </Badge>
          <div className="space-y-2 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              <span className="font-semibold text-foreground">
                {trip.from_city}
                <span className="mx-1 font-normal text-muted-foreground">→</span>
                {trip.to_city}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>تاریخ: {formatGregorianToPersian(trip.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>ظرفیت: {trip.capacity} کیلوگرم</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4 border-t bg-accent/10">
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
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>برای ادامه وارد شوید</DialogTitle>
            <DialogDescription>
              برای ارسال پیام و هماهنگی، ابتدا باید وارد حساب کاربری خود شوید یا
              یک حساب جدید بسازید.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
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
