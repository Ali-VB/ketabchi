import { ReportGenerator } from "@/components/report-generator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plane, Users } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">داشبورد</h1>
                <p className="text-muted-foreground">
                    خوش آمدید! در اینجا خلاصه‌ای از فعالیت‌های شما آمده است.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">کل درخواست‌ها</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">۱۲</div>
                        <p className="text-xs text-muted-foreground">۲ درخواست فعال</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">کل سفرها</CardTitle>
                        <Plane className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">۵</div>
                        <p className="text-xs text-muted-foreground">۱ سفر در پیش رو</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">تطبیق‌های موفق</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">۳</div>
                        <p className="text-xs text-muted-foreground">امتیاز میانگین: ۴.۸</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <ReportGenerator />
            </div>
        </div>
    );
}
