'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { findMatches } from "@/lib/firebase/firestore";
import type { MatchedRequest, MatchedTrip, BookRequest, Trip } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Users, Package, Plane, Send, MapPin, CalendarDays, Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const formatPersianDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
  } catch (e) {
    return dateString;
  }
};

export default function MatchesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [requestMatches, setRequestMatches] = useState<MatchedRequest[]>([]);
    const [tripMatches, setTripMatches] = useState<MatchedTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            findMatches(user.uid)
                .then(({ requestMatches, tripMatches }) => {
                    setRequestMatches(requestMatches);
                    setTripMatches(tripMatches);
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    const handleSendMessage = (recipientId: string) => {
        router.push(`/dashboard/messages?recipient=${recipientId}`);
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (requestMatches.length === 0 && tripMatches.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">تطبیق‌ها</h2>
                    <p className="text-muted-foreground">تطبیق‌های پیدا شده برای درخواست‌ها و سفرهای شما.</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-80">
                    <Users className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-xl font-bold tracking-tight mt-6">هنوز هیچ تطبیقی پیدا نشده است</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                        وقتی یک سفر یا درخواست منطبق با موارد شما پیدا شود، در اینجا نمایش داده خواهد شد.
                    </p>
                </div>
            </div>
        );
    }
    
    const totalQuantity = (request: BookRequest) => request.books?.reduce((sum, book) => sum + book.quantity, 0) || 0;

    const getRequestMatchText = (count: number) => {
        if (count === 1) return 'یک سفر با این درخواست منطبق است';
        const countInPersian = new Intl.NumberFormat('fa-IR').format(count);
        return `${countInPersian} سفر با این درخواست منطبق است`;
    };

    const getTripMatchText = (count: number) => {
        if (count === 1) return 'یک درخواست با این سفر منطبق است';
        const countInPersian = new Intl.NumberFormat('fa-IR').format(count);
        return `${countInPersian} درخواست با این سفر منطبق است`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">تطبیق‌ها</h2>
                <p className="text-muted-foreground">تطبیق‌های پیدا شده برای درخواست‌ها و سفرهای شما.</p>
            </div>
            <Tabs defaultValue="trips" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="requests">تطبیق برای درخواست‌های من</TabsTrigger>
                    <TabsTrigger value="trips">تطبیق برای سفرهای من</TabsTrigger>
                </TabsList>
                <TabsContent value="requests">
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {requestMatches.length > 0 ? requestMatches.map(match => (
                            <AccordionItem value={match.id} key={match.id}>
                                <AccordionTrigger className="p-4 bg-card rounded-lg hover:no-underline hover:bg-muted/50">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="text-right">
                                            <p className="font-bold">درخواست کتاب از {match.from_city} به {match.to_city}</p>
                                            <p className="text-sm text-muted-foreground">مهلت: {formatPersianDate(match.deadline_end)}</p>
                                        </div>
                                        <Badge variant="secondary">{getRequestMatchText(match.matchingTrips.length)}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0 space-y-4">
                                    {match.matchingTrips.map(trip => (
                                        <Card key={trip.id} className="bg-muted/30">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={trip.user.avatar ?? ''} data-ai-hint="user portrait" />
                                                        <AvatarFallback>{trip.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1 text-sm">
                                                        <p className="font-semibold">{trip.user.name}</p>
                                                        <div className="flex items-center gap-2 text-muted-foreground"><Plane className="h-4 w-4" /> سفر از {trip.from_city} به {trip.to_city}</div>
                                                        <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> تاریخ سفر: {formatPersianDate(trip.trip_date)}</div>
                                                        <div className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4" /> ظرفیت: {trip.capacity} کیلوگرم</div>
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => handleSendMessage(trip.userId)}>
                                                    <Send className="me-2 h-4 w-4" />
                                                    ارسال پیام
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )) : (
                            <p className="text-center text-muted-foreground p-8">هیچ تطبیقی برای درخواست‌های شما یافت نشد.</p>
                        )}
                    </Accordion>
                </TabsContent>
                <TabsContent value="trips">
                     <Accordion type="single" collapsible className="w-full space-y-2">
                        {tripMatches.length > 0 ? tripMatches.map(match => (
                            <AccordionItem value={match.id} key={match.id}>
                                <AccordionTrigger className="p-4 bg-card rounded-lg hover:no-underline hover:bg-muted/50">
                                    <div className="flex items-center justify-between w-full">
                                         <div className="text-right">
                                            <p className="font-bold">سفر از {match.from_city} به {match.to_city}</p>
                                            <p className="text-sm text-muted-foreground">تاریخ: {formatPersianDate(match.trip_date)}</p>
                                        </div>
                                        <Badge variant="secondary">{getTripMatchText(match.matchingRequests.length)}</Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 pt-0 space-y-4">
                                    {match.matchingRequests.map(request => (
                                        <Card key={request.id} className="bg-muted/30">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                     <Avatar>
                                                        <AvatarImage src={request.user.avatar ?? ''} data-ai-hint="user portrait" />
                                                        <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="space-y-1 text-sm">
                                                        <p className="font-semibold">{request.user.name}</p>
                                                        <div className="flex items-center gap-2 text-muted-foreground"><Book className="h-4 w-4" /> درخواست برای {totalQuantity(request)} جلد کتاب</div>
                                                        <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> مهلت: {formatPersianDate(request.deadline_end)}</div>
                                                        <div className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4" /> وزن: {request.weight || 'نامشخص'} کیلوگرم</div>
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => handleSendMessage(request.userId)}>
                                                    <Send className="me-2 h-4 w-4" />
                                                    ارسال پیام
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        )) : (
                           <p className="text-center text-muted-foreground p-8">هیچ تطبیقی برای سفرهای شما یافت نشد.</p>
                        )}
                    </Accordion>
                </TabsContent>
            </Tabs>
        </div>
    );
}
