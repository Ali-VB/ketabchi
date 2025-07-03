'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { Bell, ChevronDown, Home, LogOut, Mail, Package, Plane, Settings, User, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Logo } from '@/components/logo';

const menuItems = [
  { href: '/dashboard', label: 'داشبورد', icon: Home },
  { href: '/dashboard/requests', label: 'درخواست‌های من', icon: Package },
  { href: '/dashboard/trips', label: 'سفرهای من', icon: Plane },
  { href: '/dashboard/matches', label: 'تطبیق‌ها', icon: Users },
  { href: '/dashboard/messages', label: 'پیام‌ها', icon: Mail },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
                <p className="font-semibold font-headline">کتابچی</p>
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
                      <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user portrait" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="grow overflow-hidden">
                      <p className="text-sm font-semibold text-sidebar-foreground">شهریار</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>حساب کاربری من</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/profile"><User className="me-2 h-4 w-4" />پروفایل</Link></DropdownMenuItem>
                <DropdownMenuItem><Settings className="me-2 h-4 w-4" />تنظیمات</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
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
                    <h1 className="text-xl font-semibold">{menuItems.find(item => item.href === pathname)?.label || 'داشبورد'}</h1>
                 </div>
                 <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5"/>
                    <span className="sr-only">اعلان‌ها</span>
                 </Button>
            </header>
            <main className="flex-1 p-4 sm:p-6 bg-muted/20">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
