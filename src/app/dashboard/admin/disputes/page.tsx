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

// This is a temporary admin check. Replace with a robust role-based system.
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

const formatPersianDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    } catch (e) {
        return dateString;
    }
};

export default function AdminDisputesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [disputedMatches, setDisputedMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolving, setIsResolving] = useState<string | null>(null);

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
                toast({ variant: 'destructive', title: 'غیرمجاز', description: 'شما اجازه دسترسی به این صفحه را ندارید.' });
                router.push('/dashboard');
                return;
            }
            fetchDisputes();
        }
    }, [user, authLoading, router, fetchDisputes, toast]);

    const handleResolve = async (matchId: string, resolution: 'release' | 'refund') => {
        setIsResolving(matchId);
        try {
            // In a real app, this would trigger a Cloud Function to handle payment logic with Stripe.
            await resolveDispute(matchId, resolution);
            toast({ title: 'موفقیت‌آمیز', description: `وضعیت اختلاف با موفقیت به‌روزرسانی شد.` });
            fetchDisputes(); // Refresh the list
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'خطا', description: 'خطا در رسیدگی به اختلاف.' });
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>رسیدگی به اختلافات</CardTitle>
                    <CardDescription>
                        تمام تراکنش‌های با وضعیت 'مورد اختلاف' را بررسی و حل کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {disputedMatches.length === 0 ? (
                        <p className="p-8 text-center text-muted-foreground">هیچ تراکنش مورد اختلافی یافت نشد.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>درخواست‌دهنده</TableHead>
                                    <TableHead>مسافر</TableHead>
                                    <TableHead>تاریخ ثبت اختلاف</TableHead>
                                    <TableHead className="text-left">اقدامات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disputedMatches.map(match => (
                                    <TableRow key={match.id}>
                                        <TableCell>{match.request.user.displayName}</TableCell>
                                        <TableCell>{match.trip.user.displayName}</TableCell>
                                        <TableCell>{formatPersianDate(match.updatedAt)}</TableCell>
                                        <TableCell className="text-left space-x-2">
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
                                                        این عمل تراکنش را لغو کرده و پرداخت را به درخواست‌دهنده بازمی‌گرداند. این عمل غیرقابل بازگشت است.
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
                                                         این عمل تراکنش را تکمیل کرده و پرداخت را برای مسافر آزاد می‌کند. این عمل غیرقابل بازگشت است.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleResolve(match.id, 'release')} className="bg-green-600 hover:bg-green-700">تایید آزادسازی</AlertDialogAction>
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
        </div>
    );
}
