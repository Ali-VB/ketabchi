'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Match } from '@/lib/types';
import { getDisputedMatches, resolveDispute } from '@/lib/firebase/firestore';
import { Badge } from '@/components/ui/badge';
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
import { ReportGenerator } from '@/components/report-generator';

const formatPersianDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    } catch (e) {
        return dateString;
    }
};

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [disputedMatches, setDisputedMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolving, setIsResolving] = useState<string | null>(null);

    // TODO: This is a temporary admin check. Replace with a robust role-based system.
    // To access this page, replace the placeholder below with your own User UID from Firebase Authentication.
    const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

    const fetchDisputes = useCallback(() => {
        setIsLoading(true);
        getDisputedMatches()
            .then(setDisputedMatches)
            .catch(err => {
                console.error(err);
                toast({ variant: 'destructive', title: 'خطا', description: 'خطا در بارگذاری تراکنش‌های مورد اختلاف.' });
            })
            .finally(() => setIsLoading(false));
    }, [toast]);
    
    useEffect(() => {
        if (!authLoading) {
            if (!user || user.uid !== ADMIN_USER_ID) {
                toast({ variant: 'destructive', title: 'دسترسی غیرمجاز', description: 'شما اجازه دسترسی به این صفحه را ندارید.' });
                router.push('/dashboard');
                return;
            }
            fetchDisputes();
        }
    }, [user, authLoading, router, fetchDisputes, toast]);

    const handleResolve = async (matchId: string, resolution: 'release' | 'refund') => {
        setIsResolving(matchId);
        try {
            await resolveDispute(matchId, resolution);
            toast({ title: 'موفق', description: `تراکنش با موفقیت ${resolution === 'release' ? 'تایید و پرداخت شد' : 'لغو و بازپرداخت شد'}.` });
            fetchDisputes(); // Refresh the list
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'خطا', description: 'خطا در حل و فصل تراکنش.' });
        } finally {
            setIsResolving(null);
        }
    }

    if (authLoading || isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (ADMIN_USER_ID === 'YOUR_ADMIN_USER_ID_HERE') {
        return (
             <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/10 p-12 text-center h-80">
                <h3 className="text-xl font-bold tracking-tight text-destructive">پیکربندی ادمین لازم است</h3>
                <p className="text-sm text-destructive/80 mt-2 max-w-md">
                   برای استفاده از این صفحه، لطفاً فایل <code className="font-mono text-xs bg-destructive/20 p-1 rounded">src/app/dashboard/admin/page.tsx</code> را ویرایش کرده و شناسه کاربری ادمین را جایگزین کنید.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">ابزارهای ادمین</h2>
                <p className="text-muted-foreground">تراکنش‌های مورد اختلاف را مدیریت کرده و گزارش‌های پلتفرم را ایجاد کنید.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>تراکنش‌های مورد اختلاف</CardTitle>
                    <CardDescription>
                        در اینجا لیست تمام تراکنش‌هایی که وضعیت آنها "disputed" است نمایش داده می‌شود.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {disputedMatches.length === 0 ? (
                        <p className="text-center text-muted-foreground p-8">هیچ تراکنش مورد اختلافی یافت نشد.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>درخواست‌دهنده</TableHead>
                                    <TableHead>مسافر</TableHead>
                                    <TableHead>تاریخ ثبت اختلاف</TableHead>
                                    <TableHead className="text-left">عملیات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disputedMatches.map(match => (
                                    <TableRow key={match.id}>
                                        <TableCell>{match.request.user.name}</TableCell>
                                        <TableCell>{match.trip.user.name}</TableCell>
                                        <TableCell>{formatPersianDate(match.updatedAt)}</TableCell>
                                        <TableCell className="text-left space-x-2 space-x-reverse">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                     <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        disabled={isResolving === match.id}
                                                    >
                                                        {isResolving === match.id && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                                        بازپرداخت به درخواست‌دهنده
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        با این کار، تراکنش لغو شده و مبلغ به حساب درخواست‌دهنده بازگردانده می‌شود. این عمل غیرقابل بازگشت است.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleResolve(match.id, 'refund')} className="bg-destructive hover:bg-destructive/90">تایید بازپرداخت</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        disabled={isResolving === match.id}
                                                    >
                                                         {isResolving === match.id && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                                        آزادسازی برای مسافر
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        با این کار، تراکنش تکمیل شده و مبلغ به حساب مسافر واریز می‌شود. این عمل غیرقابل بازگشت است.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleResolve(match.id, 'release')} className="bg-green-600 hover:bg-green-700">تایید و پرداخت</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <div className="pt-4">
                <ReportGenerator />
            </div>
        </div>
    );
}
