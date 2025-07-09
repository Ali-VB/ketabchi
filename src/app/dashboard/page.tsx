'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plane, Users, Loader2, ShieldAlert, BookOpen, Handshake } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getUserRequests, getUserTrips, getMatchesForUser, getPlatformStats } from '@/lib/firebase/firestore';
import { ReportGenerator } from '@/components/report-generator';

const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalTrips: 0,
    totalMatches: 0,
    disputedMatches: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getPlatformStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">داشبورد ادمین</h1>
        <p className="text-muted-foreground">
          در اینجا خلاصه‌ای از فعالیت‌های کل پلتفرم آمده است.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل تراکنش‌ها</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تراکنش‌های مورد اختلاف</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{stats.disputedMatches}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


function UserDashboard() {
  const { user } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([
        getUserRequests(user.uid),
        getUserTrips(user.uid),
        getMatchesForUser(user.uid),
      ])
        .then(([requests, trips, matches]) => {
          setRequestCount(requests.length);
          setTripCount(trips.length);
          setMatchCount(matches.length);
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
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <div className="text-2xl font-bold">{matchCount}</div>
            )}
            <p className="text-xs text-muted-foreground">تعداد کل موارد دارای تطبیق</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
    const { user, loading } = useAuth();
    
    if (loading) {
         return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (user && user.uid === ADMIN_USER_ID) {
        return <AdminDashboard />;
    }

    return <UserDashboard />;
}
