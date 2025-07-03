import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Send } from 'lucide-react';
import type { BookRequest } from '@/lib/types';
import { Badge } from './ui/badge';

interface RequestCardProps {
  request: BookRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="p-0">
        <Image
          src="https://placehold.co/600x400.png"
          alt={request.title}
          width={600}
          height={400}
          className="h-48 w-full object-cover"
          data-ai-hint="book photography"
        />
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Badge variant="secondary" className="mb-2 bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">درخواست کتاب</Badge>
        <h3 className="mb-2 text-lg font-bold font-headline">{request.title}</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>مقصد: {request.to_city}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            <span>مهلت: {request.deadline}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 bg-blue-100/50 dark:bg-blue-900/30">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={request.user.avatar} alt={request.user.name} />
            <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{request.user.name}</span>
        </div>
        <Button size="sm" variant="ghost">
          ارسال پیام
          <Send className="ms-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
