'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plane, Users, Loader2 } from 'lucide-react';
import { ReportGenerator } from '@/components/report-generator';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getUserRequests, getUserTrips } from '@/lib/firebase/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([getUserRequests(user.uid), getUserTrips(user.uid)])
        .then(([requests, trips]) => {
          setRequestCount(requests.length);
          setTripCount(trips.length);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user]);

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
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{requestCount}</div>
            )}
            <p className="text-xs text-muted-foreground">تعداد کل درخواست‌های ثبت‌شده</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل سفرها</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{tripCount}</div>
            )}
            <p className="text-xs text-muted-foreground">تعداد کل سفرهای اعلام‌شده</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تطبیق‌های موفق</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">۰</div>
            <p className="text-xs text-muted-foreground">به‌زودی...</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <ReportGenerator />
      </div>
    </div>
  );
}
