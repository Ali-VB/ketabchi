'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// This is a temporary admin check. Replace with a robust role-based system.
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

export default function AdminSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isCleaning, setIsCleaning] = useState(false);

    useEffect(() => {
        if (!authLoading && (!user || user.uid !== ADMIN_USER_ID)) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);
    
    const handleCleanDatabase = async () => {
        setIsCleaning(true);
        try {
            const response = await fetch('/api/admin/clean-database', {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'خطا در پاکسازی پایگاه داده.');
            }
            toast({
                title: 'موفقیت‌آمیز',
                description: 'پایگاه داده با موفقیت پاکسازی شد.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'خطا',
                description: (error as Error).message,
            });
        } finally {
            setIsCleaning(false);
        }
    }

    if (authLoading || !user) {
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
                    <CardTitle>تنظیمات پلتفرم</CardTitle>
                    <CardDescription>
                       متغیرهای اصلی پلتفرم را در اینجا مدیریت کنید. این بخش هنوز پیاده‌سازی نشده است.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <Label htmlFor="deliveryRate">نرخ تحویل (به ازای هر کیلوگرم)</Label>
                            <Input id="deliveryRate" type="number" placeholder="5.00" disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="platformFee">کارمزد پلتفرم (%)</Label>
                            <Input id="platformFee" type="number" placeholder="10" disabled />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="travelerCommission">کمیسیون مسافر (%)</Label>
                            <Input id="travelerCommission" type="number" placeholder="80" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="autoConfirm">زمان تایید خودکار (روز)</Label>
                            <Input id="autoConfirm" type="number" placeholder="7" disabled />
                        </div>

                        <Button type="submit" disabled>ذخیره تغییرات</Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>منطقه خطر</CardTitle>
                    <CardDescription>
                        این اقدامات غیرقابل بازگشت هستند. لطفا با احتیاط عمل کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                        <div>
                            <h4 className="font-semibold">پاکسازی پایگاه داده</h4>
                            <p className="text-sm text-muted-foreground">تمام درخواست‌ها، سفرها، تراکنش‌ها و کاربران غیرادمین را حذف کنید.</p>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isCleaning}>
                                    {isCleaning && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    پاکسازی پایگاه داده
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>آیا کاملا مطمئن هستید؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        این یک عمل مخرب است و تمام داده‌های کاربران را برای همیشه حذف خواهد کرد. این عمل غیرقابل بازگشت است.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>انصراف</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCleanDatabase} className="bg-destructive hover:bg-destructive/90">بله، همه چیز را حذف کن</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
