import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MatchesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">تطبیق‌ها</h2>
                <p className="text-muted-foreground">تطبیق‌های پیدا شده برای درخواست‌ها و سفرهای شما.</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-80">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-xl font-bold tracking-tight mt-6">سیستم تطبیق خودکار در حال توسعه است</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                    در حال حاضر می‌توانید با مرور درخواست‌ها و سفرهای موجود در صفحه اصلی، به صورت دستی با دیگران ارتباط برقرار کنید.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/">مشاهده صفحه اصلی</Link>
                </Button>
            </div>
        </div>
    )
}
