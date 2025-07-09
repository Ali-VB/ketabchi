'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { getAllUsers } from '@/lib/firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// This is a temporary admin check. Replace with a robust role-based system.
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

const formatPersianDate = (dateString: string | undefined) => {
    if (!dateString) return 'نامشخص';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
    } catch (e) {
        return dateString;
    }
};

export default function UserManagementPage() {
    const { user: authUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!authUser || authUser.uid !== ADMIN_USER_ID) {
                toast({ variant: 'destructive', title: 'غیرمجاز', description: 'شما اجازه دسترسی به این صفحه را ندارید.' });
                router.push('/dashboard');
                return;
            }
            
            setIsLoading(true);
            getAllUsers()
                .then(setUsers)
                .catch(err => {
                    console.error(err);
                    toast({ variant: 'destructive', title: 'خطا', description: 'خطا در بارگذاری لیست کاربران. لطفا قوانین امنیتی Firestore را بررسی کنید.' });
                })
                .finally(() => setIsLoading(false));
        }
    }, [authUser, authLoading, router, toast]);

    if (authLoading || isLoading) {
        return (
            <div className="flex h-96 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>مدیریت کاربران</CardTitle>
                <CardDescription>
                    لیستی از تمام کاربران ثبت‌نام کرده در پلتفرم.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {users.length === 0 && !isLoading ? (
                    <p className="p-8 text-center text-muted-foreground">هیچ کاربری یافت نشد.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>کاربر</TableHead>
                                <TableHead>ایمیل</TableHead>
                                <TableHead>تاریخ عضویت</TableHead>
                                <TableHead>شناسه کاربر (UID)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.photoURL ?? `https://placehold.co/40x40.png`} data-ai-hint="user portrait" />
                                                <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium">{user.displayName}
                                                {user.uid === ADMIN_USER_ID && <Badge variant="destructive" className="ms-2">ادمین</Badge>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{formatPersianDate(user.createdAt)}</TableCell>
                                    <TableCell className="font-mono text-xs text-left" dir="ltr">{user.uid}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
