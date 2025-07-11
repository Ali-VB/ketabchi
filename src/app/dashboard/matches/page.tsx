'use client';
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { getMatchesForUser, verifyDeliveryCode, confirmDeliveryManually, disputeMatch } from "@/lib/firebase/firestore";
import type { Match } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Package, Plane, KeyRound, ShieldCheck, ShieldAlert, CheckCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const formatPersianDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    } catch (e) {
        return dateString;
    }
};

const statusConfig = {
    active: { text: 'فعال', icon: HelpCircle, color: 'bg-yellow-500' },
    completed: { text: 'تکمیل شده', icon: CheckCircle, color: 'bg-green-500' },
    disputed: { text: 'اعتراض ثبت شده', icon: ShieldAlert, color: 'bg-red-500' },
    cancelled: { text: 'لغو شده', icon: ShieldAlert, color: 'bg-gray-500' },
};


const RequesterMatchCard = ({ match, onUpdate }: { match: Match, onUpdate: () => void }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDisputing, setIsDisputing] = useState(false);

    const handleConfirm = async () => {
        if (!user) return;
        setIsConfirming(true);
        try {
            await confirmDeliveryManually(match.id, user.uid);
            toast({ title: "موفق", description: "تحویل با موفقیت تایید شد. پرداخت برای مسافر آزاد خواهد شد." });
            onUpdate();
        } catch (error) {
            toast({ variant: "destructive", title: "خطا", description: "خطا در تایید تحویل." });
            console.error(error);
        } finally {
            setIsConfirming(false);
        }
    };
    
    const handleDispute = async () => {
        if (!user) return;
        setIsDisputing(true);
        try {
            await disputeMatch(match.id, user.uid);
            toast({ title: "ثبت شد", description: "اعتراض شما ثبت شد. مدیران در اسرع وقت بررسی خواهند کرد." });
            onUpdate();
        } catch (error) {
            toast({ variant: "destructive", title: "خطا", description: "خطا در ثبت اعتراض." });
            console.error(error);
        } finally {
            setIsDisputing(false);
        }
    };

    const StatusBadge = statusConfig[match.status];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>سفر از {match.trip.from_city} به {match.trip.to_city}</CardTitle>
                        <CardDescription>مسافر: {match.trip.user.displayName}</CardDescription>
                    </div>
                    <Badge variant="secondary"><StatusBadge.icon className="h-4 w-4 me-1" />{StatusBadge.text}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p>درخواست شما برای <span className="font-bold">{match.request.books?.reduce((s,b) => s + b.quantity, 0) || 0} جلد کتاب</span> در تاریخ <span className="font-bold">{formatPersianDate(match.trip.trip_date)}</span></p>
                {match.status === 'active' && (
                    <Alert variant="default" className="bg-primary/10 border-primary/20">
                        <KeyRound className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-bold text-primary">کد تحویل شما: {match.deliveryCode}</AlertTitle>
                        <AlertDescription>
                           فقط زمانی این کد را به مسافر بدهید که کتاب‌ها را به طور کامل تحویل گرفته‌اید.
                        </AlertDescription>
                    </Alert>
                )}
                 {match.status === 'completed' && (
                    <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-500/20">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle>تراکنش تکمیل شد</AlertTitle>
                        <AlertDescription>این تحویل با موفقیت انجام شده است.</AlertDescription>
                    </Alert>
                )}
                 {match.status === 'disputed' && (
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>اعتراض ثبت شده</AlertTitle>
                        <AlertDescription>این تراکنش مورد اعتراض قرار گرفته و توسط مدیران بررسی خواهد شد.</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            {match.status === 'active' && (
                <CardFooter className="flex-col items-stretch space-y-4">
                     <p className="text-xs text-center text-muted-foreground">در صورت عدم تأیید تا ۷ روز، پرداخت به‌صورت خودکار انجام خواهد شد.</p>
                     <div className="flex gap-4 justify-end">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDisputing}>
                                    {isDisputing && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    کتاب‌ها را دریافت نکرده‌ام
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                    با این کار یک مورد اختلاف ثبت می‌شود و مدیران برای حل آن با شما و مسافر تماس خواهند گرفت.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>لغو</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDispute} className="bg-destructive hover:bg-destructive/90">تایید و ثبت اعتراض</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="default" disabled={isConfirming}>
                                     {isConfirming && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    تحویل را تأیید می‌کنم
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>تایید تحویل کتاب‌ها؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                   با تایید، پرداخت برای مسافر آزاد خواهد شد. این عمل غیرقابل بازگشت است.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>لغو</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirm}>بله، تایید می‌کنم</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                </CardFooter>
            )}
        </Card>
    )
}

const TravelerMatchCard = ({ match, onUpdate }: { match: Match, onUpdate: () => void }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [code, setCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || code.length !== 6) {
            toast({ variant: "destructive", title: "خطا", description: "کد تحویل باید ۶ رقمی باشد." });
            return;
        }

        setIsVerifying(true);
        try {
            const success = await verifyDeliveryCode(match.id, code, user.uid);
            if (success) {
                toast({ title: "موفق", description: "کد تایید شد! مبلغ به حساب شما واریز خواهد شد." });
                onUpdate();
            } else {
                toast({ variant: "destructive", title: "خطا", description: "کد وارد شده صحیح نیست." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "خطا", description: "خطا در بررسی کد." });
            console.error(error);
        } finally {
            setIsVerifying(false);
        }
    };
    
    const StatusBadge = statusConfig[match.status];
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>درخواست کتاب به {match.request.to_city}</CardTitle>
                        <CardDescription>درخواست‌دهنده: {match.request.user.displayName}</CardDescription>
                    </div>
                     <Badge variant="secondary"><StatusBadge.icon className="h-4 w-4 me-1" />{StatusBadge.text}</Badge>
                </div>
            </CardHeader>
             <CardContent>
                <p>شما قبول کرده‌اید که <span className="font-bold">{match.request.books?.reduce((s,b) => s + b.quantity, 0) || 0} جلد کتاب</span> را برای این کاربر ببرید.</p>
                 {match.status === 'completed' && (
                    <Alert variant="default" className="mt-4 bg-green-100 dark:bg-green-900/30 border-green-500/20">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle>تراکنش تکمیل شد</AlertTitle>
                        <AlertDescription>مبلغ این تحویل برای شما آزاد شده است.</AlertDescription>
                    </Alert>
                )}
                 {match.status === 'disputed' && (
                    <Alert variant="destructive" className="mt-4">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>اعتراض ثبت شده</AlertTitle>
                        <AlertDescription>این تراکنش مورد اعتراض قرار گرفته و توسط مدیران بررسی خواهد شد.</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            {match.status === 'active' && (
                <CardFooter>
                    <form onSubmit={handleVerify} className="w-full flex items-center gap-4">
                        <Input 
                            placeholder="کد ۶ رقمی تحویل را وارد کنید" 
                            className="flex-1" 
                            dir="ltr"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={6}
                        />
                        <Button type="submit" disabled={isVerifying || code.length !== 6}>
                             {isVerifying && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                            تایید و دریافت وجه
                        </Button>
                    </form>
                </CardFooter>
            )}
        </Card>
    );
};


export default function MatchesPage() {
    const { user, loading: authLoading } = useAuth();
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMatches = useCallback(() => {
        if (user) {
            setIsLoading(true);
            getMatchesForUser(user.uid)
                .then(setMatches)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    if (authLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    const myRequests = matches.filter(m => m.requesterId === user?.uid);
    const myDeliveries = matches.filter(m => m.travelerId === user?.uid);

    if (isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (matches.length === 0) {
         return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline">تراکنش‌ها</h2>
                    <p className="text-muted-foreground">تراکنش‌های فعال و تکمیل‌شده شما در اینجا نمایش داده می‌شوند.</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-80">
                    <Users className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-xl font-bold tracking-tight mt-6">هنوز هیچ تراکنشی ندارید</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                        وقتی یک درخواست و سفر با هم تطبیق داده شوند و شما آن را بپذیرید، در اینجا نمایش داده خواهد شد.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">تراکنش‌ها</h2>
                <p className="text-muted-foreground">تراکنش‌های فعال و تکمیل‌شده شما.</p>
            </div>
            <Tabs defaultValue="requests" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="requests">درخواست‌های من ({myRequests.length})</TabsTrigger>
                    <TabsTrigger value="deliveries">تحویل‌های من ({myDeliveries.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="requests" className="space-y-4 pt-4 min-h-[400px]">
                    {myRequests.length > 0 ? myRequests.map(match => (
                        <RequesterMatchCard key={match.id} match={match} onUpdate={fetchMatches} />
                    )) : <p className="text-center text-muted-foreground p-8">تراکنشی برای درخواست‌های شما یافت نشد.</p>}
                </TabsContent>
                <TabsContent value="deliveries" className="space-y-4 pt-4 min-h-[400px]">
                     {myDeliveries.length > 0 ? myDeliveries.map(match => (
                        <TravelerMatchCard key={match.id} match={match} onUpdate={fetchMatches} />
                    )) : <p className="text-center text-muted-foreground p-8">تراکنشی برای تحویل‌های شما یافت نشد.</p>}
                </TabsContent>
            </Tabs>
        </div>
    );
}
