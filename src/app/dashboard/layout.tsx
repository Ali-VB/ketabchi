'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, ChevronDown, Home, Loader2, LogOut, Mail, Package, Plane, Settings, User, Users, ShieldAlert, Handshake, BookOpen } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/logo';
import { useAuth } from '@/components/auth-provider';
import { signOut } from '@/lib/firebase/auth';
import { useEffect } from 'react';

// This is a temporary admin check. Replace with a robust role-based system.
const ADMIN_USER_ID = 'jwHiUx2XD3dcl3C0x7mobpkGOYy2';

const userMenuItems = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/dashboard/requests', label: 'درخواست‌های من', icon: Package },
  { href: '/dashboard/trips', label: 'سفرهای من', icon: Plane },
  { href: '/dashboard/matches', label: 'تراکنش‌ها', icon: Handshake },
  { href: '/dashboard/messages', label: 'پیام‌ها', icon: Mail },
];

const adminMenuItems = [
    { href: '/dashboard', label: 'داشبورد', icon: Home },
    { href: '/dashboard/admin/matches', label: 'تراکنش‌ها', icon: Handshake },
    { href: '/dashboard/admin/users', label: 'کاربران', icon: Users },
    { href: '/dashboard/admin/disputes', label: 'اختلافات', icon: ShieldAlert },
    { href: '/dashboard/admin/reports', label: 'گزارش‌ها', icon: BookOpen },
    { href: '/dashboard/admin/settings', label: 'تنظیمات', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const isAdmin = user.uid === ADMIN_USER_ID;
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const getPageTitle = (path: string) => {
    if (isAdmin) {
        if (path.startsWith('/dashboard/admin/matches')) return 'مدیریت تراکنش‌ها';
        if (path.startsWith('/dashboard/admin/users')) return 'مدیریت کاربران';
        if (path.startsWith('/dashboard/admin/disputes')) return 'رسیدگی به اختلافات';
        if (path.startsWith('/dashboard/admin/reports')) return 'گزارش‌های پلتفرم';
        if (path.startsWith('/dashboard/admin/settings')) return 'تنظیمات پلتفرم';
        if (path === '/dashboard') return 'داشبورد ادمین';
    }
    
    const allItems = [...userMenuItems];
    const directMatch = allItems.find(item => item.href === path);
    if (directMatch) return directMatch.label;
    if (path.startsWith('/dashboard/profile')) return 'پروفایل کاربری';
    return 'داشبورد';
  }
  const pageTitle = getPageTitle(pathname);


  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar side="right" collapsible="icon">
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 p-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Logo />
              </Button>
              <div className="grow overflow-hidden">
                <p className="font-semibold font-headline">Ketabchi</p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent">
                    <Avatar className="size-8">
                      <AvatarImage src={user.photoURL ?? `https://placehold.co/40x40.png`} data-ai-hint="user portrait" />
                      <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="grow overflow-hidden">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.displayName || user.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>{isAdmin ? 'حساب ادمین' : 'حساب کاربری من'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/profile"><User className="me-2 h-4 w-4" />پروفایل</Link></DropdownMenuItem>
                <DropdownMenuItem><Settings className="me-2 h-4 w-4" />تنظیمات</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                  <LogOut className="me-2 h-4 w-4" />
                  خروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                 <SidebarTrigger className="md:hidden me-4" />
                 <div className="flex-1">
                    <h1 className="text-xl font-semibold">{pageTitle}</h1>
                 </div>
                 <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5"/>
                    <span className="sr-only">Notifications</span>
                 </Button>
            </header>
            <main className="flex-1 p-4 sm:p-6 bg-muted/20">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
