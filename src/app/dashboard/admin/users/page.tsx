'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import { getAllUsers, banUser, unbanUser } from '@/lib/firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchUsers = useCallback(() => {
        setIsLoading(true);
        getAllUsers()
            .then(setUsers)
            .catch(err => {
                console.error(err);
                toast({ variant: 'destructive', title: 'خطا', description: 'خطا در بارگذاری لیست کاربران. لطفا قوانین امنیتی Firestore را بررسی کنید.' });
            })
            .finally(() => setIsLoading(false));
    }, [toast]);

    useEffect(() => {
        if (!authLoading) {
            if (!authUser || authUser.uid !== ADMIN_USER_ID) {
                toast({ variant: 'destructive', title: 'غیرمجاز', description: 'شما اجازه دسترسی به این صفحه را ندارید.' });
                router.push('/dashboard');
                return;
            }
            fetchUsers();
        }
    }, [authUser, authLoading, router, toast, fetchUsers]);
    
    const handleBanToggle = async (userToUpdate: User) => {
        setIsActionLoading(true);
        try {
            if (userToUpdate.isBanned) {
                await unbanUser(userToUpdate.uid);
                toast({ title: 'موفقیت‌آمیز', description: `${userToUpdate.displayName} از محرومیت خارج شد.`});
            } else {
                await banUser(userToUpdate.uid);
                toast({ title: 'موفقیت‌آمیز', description: `${userToUpdate.displayName} محروم شد.`});
            }
            fetchUsers(); // Refresh the user list
        } catch (error) {
             toast({ variant: 'destructive', title: 'خطا', description: 'خطا در به‌روزرسانی وضعیت کاربر.'});
        } finally {
            setIsActionLoading(false);
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
                                <TableHead>وضعیت</TableHead>
                                <TableHead>تاریخ عضویت</TableHead>
                                <TableHead className="text-left">اقدامات</TableHead>
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
                                    <TableCell>
                                        {user.isBanned && <Badge variant="destructive">محروم شده</Badge>}
                                    </TableCell>
                                    <TableCell>{formatPersianDate(user.createdAt)}</TableCell>
                                    <TableCell className="text-left">
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant={user.isBanned ? 'outline' : 'destructive'}
                                                    size="sm"
                                                    disabled={user.uid === ADMIN_USER_ID || isActionLoading}
                                                >
                                                    {isActionLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                                    {user.isBanned ? 'رفع محرومیت' : 'محروم کردن'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {user.isBanned
                                                            ? `این عمل کاربر ${user.displayName} را از محرومیت خارج می‌کند.`
                                                            : `این عمل کاربر ${user.displayName} را محروم می‌کند.`
                                                        }
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>لغو</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleBanToggle(user)}
                                                        className={user.isBanned ? '' : 'bg-destructive hover:bg-destructive/90'}
                                                    >
                                                        تایید
                                                    </AlertDialogAction>
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
    );
}
