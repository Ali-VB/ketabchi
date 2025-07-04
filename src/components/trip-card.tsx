import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Package, Plane, Send } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { Badge } from './ui/badge';

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
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export function TripCard({ trip }: TripCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full">
      <CardContent className="p-4 space-y-3 flex-1">
        <Badge variant='secondary' className='bg-accent/10 text-accent'>اعلام سفر</Badge>
        <div className="space-y-2 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                <span className='font-semibold text-foreground'>
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
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Send className="me-2 h-4 w-4" />
          ارسال پیام
        </Button>
      </CardFooter>
    </Card>
  );
}
