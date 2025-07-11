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

// This is a temporary admin check. Replace with a robust role-based system.
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

export default function AdminSettingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && (!user || user.uid !== ADMIN_USER_ID)) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

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
        </div>
    )
}
