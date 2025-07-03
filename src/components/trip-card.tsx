import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Package, Send } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { Badge } from './ui/badge';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
      <CardHeader className="p-0">
        <Image
          src="https://placehold.co/600x400.png"
          alt={`سفر از ${trip.from_city} به ${trip.to_city}`}
          width={600}
          height={400}
          className="h-48 w-full object-cover"
          data-ai-hint="travel destination"
        />
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Badge variant="secondary" className="mb-2 bg-teal-200 text-teal-800 dark:bg-teal-800 dark:text-teal-200">اعلام سفر</Badge>
        <h3 className="mb-2 text-lg font-bold font-headline">
          سفر از {trip.from_city} به {trip.to_city}
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-teal-500" />
            <span>تاریخ سفر: {trip.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-teal-500" />
            <span>ظرفیت: {trip.capacity} کیلوگرم</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-teal-100/50 dark:bg-teal-900/30">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={trip.user.avatar} alt={trip.user.name} />
            <AvatarFallback>{trip.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{trip.user.name}</span>
        </div>
        <Button size="sm" variant="ghost">
          ارسال پیام
          <Send className="ms-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
