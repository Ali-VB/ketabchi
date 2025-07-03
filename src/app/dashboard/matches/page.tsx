import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Calendar, Package, Plane, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockMatches = [
    {
        id: 'match1',
        request: { id: 'req1', title: 'کوری', user: { name: 'سارا', avatar: 'https://placehold.co/40x40.png' }},
        trip: { id: 'trip1', from: 'مادرید', to: 'تهران', user: { name: 'علی', avatar: 'https://placehold.co/40x40.png'}},
        date: '۱۴۰۳/۰۵/۱۴',
        status: 'pending'
    },
    {
        id: 'match2',
        request: { id: 'req2', title: 'طاعون', user: { name: 'نیما', avatar: 'https://placehold.co/40x40.png' }},
        trip: { id: 'trip2', from: 'برلین', to: 'شیراز', user: { name: 'زهرا', avatar: 'https://placehold.co/40x40.png'}},
        date: '۱۴۰۳/۰۵/۲۰',
        status: 'done'
    }
]

export default function MatchesPage() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="default" className="bg-yellow-500 text-white">در انتظار تأیید</Badge>;
            case 'done': return <Badge variant="secondary" className="bg-green-500 text-white">انجام‌شده</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">تطبیق‌ها</h2>
                <p className="text-muted-foreground">تطبیق‌های پیدا شده برای درخواست‌ها و سفرهای شما.</p>
            </div>
            <div className="space-y-4">
                {mockMatches.map(match => (
                    <Card key={match.id}>
                        <CardHeader className="flex flex-row justify-between items-start">
                           <div>
                            <CardTitle>تطبیق برای کتاب «{match.request.title}»</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Calendar className="h-4 w-4"/>
                                <span>{match.date}</span>
                            </div>
                           </div>
                           {getStatusBadge(match.status)}
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6 items-center">
                            <div className="flex items-center gap-4">
                                <Package className="h-8 w-8 text-primary"/>
                                <div>
                                    <p className="font-semibold">درخواست از طرف</p>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={match.request.user.avatar} />
                                            <AvatarFallback>{match.request.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p>{match.request.user.name}</p>
                                    </div>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <Plane className="h-8 w-8 text-accent"/>
                                <div>
                                    <p className="font-semibold">سفر توسط</p>
                                    <div className="flex items-center gap-2">
                                         <Avatar className="h-6 w-6">
                                            <AvatarImage src={match.trip.user.avatar} />
                                            <AvatarFallback>{match.trip.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p>{match.trip.user.name} (از {match.trip.from} به {match.trip.to})</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled={match.status === 'done'}>
                                ارسال پیام
                                <Send className="ms-2 h-4 w-4"/>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
