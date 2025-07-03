import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin } from 'lucide-react';
import type { BookRequest } from '@/lib/types';

interface RequestCardProps {
  request: BookRequest;
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

export function RequestCard({ request }: RequestCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg h-full">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-bold font-headline text-primary">درخواست کتاب</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              مقصد: <span className="font-semibold text-foreground">{request.to_city}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>مهلت: {formatGregorianToPersian(request.deadline)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 mt-auto border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={request.user.avatar} alt={request.user.name} data-ai-hint="person face"/>
            <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{request.user.name}</span>
        </div>
        <Button size="sm">
          تماس
        </Button>
      </CardFooter>
    </Card>
  );
}
