'use client';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Send } from 'lucide-react';
import type { BookRequest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';

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
  const { user } = useAuth();
  const router = useRouter();

  const handleSendMessage = () => {
    if (!user) {
      const redirectUrl = encodeURIComponent(
        `/dashboard/messages?recipient=${request.userId}`
      );
      router.push(`/login?redirect=${redirectUrl}`);
    } else {
      router.push(`/dashboard/messages?recipient=${request.userId}`);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-full">
      <CardContent className="p-4 space-y-3 flex-1">
        <Badge variant="secondary" className="bg-primary/10 text-primary">درخواست کتاب</Badge>
        <h2 className="text-xl font-bold font-headline">{request.title}</h2>
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
      <CardFooter className="flex items-center justify-between p-4 border-t bg-primary/10">
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
    </Card>
  );
}
