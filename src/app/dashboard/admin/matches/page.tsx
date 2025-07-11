
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, PackageSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Match } from '@/lib/types';
import { getAllMatches } from '@/lib/firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// This is a temporary admin check. Replace with a robust role-based system.
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

const formatPersianDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
    } catch (e) {
        return dateString;
    }
};

const getStatusBadge = (status: Match['status']) => {
  const statusStyles = {
    active: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-100",
    disputed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-100",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100",
  }
  const statusText = {
      active: 'فعال',
      completed: 'تکمیل شده',
      disputed: 'مورد اختلاف',
      cancelled: 'لغو شده',
  }
  return <Badge variant="secondary" className={cn("capitalize", statusStyles[status])}>{statusText[status]}</Badge>;
};

export default function MatchManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [allMatches, setAllMatches] = useState<Match[]>([]);
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.uid !== ADMIN_USER_ID) {
                toast({ variant: 'destructive', title: 'Unauthorized', description: 'You do not have permission to view this page.' });
                router.push('/dashboard');
                return;
            }
            
            setIsLoading(true);
            getAllMatches()
                .then(matches => {
                    setAllMatches(matches);
                    setFilteredMatches(matches);
                })
                .catch(err => {
                    console.error(err);
                    toast({ variant: 'destructive', title: 'خطا', description: 'خطا در بارگذاری تراکنش‌ها.' });
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading, router, toast]);

    useEffect(() => {
        if (activeTab === 'all') {
            setFilteredMatches(allMatches);
        } else {
            setFilteredMatches(allMatches.filter(match => match.status === activeTab));
        }
    }, [activeTab, allMatches]);

    if (authLoading || isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    const renderMatchDetails = (match: Match) => (
        <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold">درخواست‌دهنده</h4>
                    <p>{match.request.user.displayName}</p>
                    <p className="text-muted-foreground">{match.request.user.email}</p>
                </div>
                <div>
                    <h4 className="font-semibold">مسافر</h4>
                    <p>{match.trip.user.displayName}</p>
                    <p className="text-muted-foreground">{match.trip.user.email}</p>
                </div>
            </div>
            
            <Separator />

            <div>
                 <h4 className="font-semibold mb-2">جزئیات درخواست</h4>
                 <div className="space-y-1">
                    {match.request.books?.map((book, index) => (
                        <p key={index} className="text-muted-foreground"> - {book.quantity}x {book.title} ({book.author})</p>
                    ))}
                 </div>
                 <p className="text-muted-foreground mt-2">از <span className="font-medium text-foreground">{match.request.from_city}</span> به <span className="font-medium text-foreground">{match.request.to_city}</span></p>
            </div>
            
            <Separator />

            <div>
                 <h4 className="font-semibold mb-2">جزئیات سفر</h4>
                 <p className="text-muted-foreground">از <span className="font-medium text-foreground">{match.trip.from_city}</span> به <span className="font-medium text-foreground">{match.trip.to_city}</span></p>
                 <p className="text-muted-foreground">تاریخ سفر: <span className="font-medium text-foreground">{formatPersianDate(match.trip.trip_date)}</span></p>
            </div>
        </div>
    );

    const renderTableContent = () => {
        if (filteredMatches.length === 0) {
            return (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                       هیچ تراکنشی برای این وضعیت یافت نشد.
                    </TableCell>
                </TableRow>
            )
        }
        return (
            <>
            {filteredMatches.map(match => (
                <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.request.user.displayName}</TableCell>
                    <TableCell className="font-medium">{match.trip.user.displayName}</TableCell>
                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                    <TableCell>${(match.amount ?? 0).toFixed(2)}</TableCell>
                    <TableCell>{formatPersianDate(match.createdAt)}</TableCell>
                    <TableCell className="text-left">
                        <Button variant="outline" size="sm" onClick={() => setSelectedMatch(match)}>مشاهده جزئیات</Button>
                    </TableCell>
                </TableRow>
            ))}
            </>
        )
    }

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>مدیریت تراکنش‌ها</CardTitle>
                <CardDescription>
                    تمام تراکنش‌های روی پلتفرم را مشاهده و مدیریت کنید.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-end">
                        <TabsList>
                            <TabsTrigger value="all">همه</TabsTrigger>
                            <TabsTrigger value="completed">تکمیل‌شده</TabsTrigger>
                            <TabsTrigger value="active">فعال</TabsTrigger>
                            <TabsTrigger value="disputed">مورد اختلاف</TabsTrigger>
                            <TabsTrigger value="cancelled">لغو شده</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value={activeTab} className="mt-4">
                       <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>درخواست‌دهنده</TableHead>
                                        <TableHead>مسافر</TableHead>
                                        <TableHead>وضعیت</TableHead>
                                        <TableHead>مبلغ</TableHead>
                                        <TableHead>تاریخ ایجاد</TableHead>
                                        <TableHead className="text-left">اقدامات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {renderTableContent()}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        <Dialog open={!!selectedMatch} onOpenChange={(isOpen) => !isOpen && setSelectedMatch(null)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>جزئیات تراکنش</DialogTitle>
                     <DialogDescription>
                        اطلاعات کامل تراکنش بین درخواست‌دهنده و مسافر.
                    </DialogDescription>
                </DialogHeader>
                {selectedMatch && renderMatchDetails(selectedMatch)}
            </DialogContent>
        </Dialog>
        </>
    );
}
