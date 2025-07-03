'use client';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { RequestCard } from "@/components/request-card";
import { type BookRequest } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewRequestForm } from "@/components/new-request-form";
import { useState } from "react";

const mockUserRequests: BookRequest[] = [
  { id: '1', title: 'صد سال تنهایی', to_city: 'تهران', deadline: '۱۴۰۳/۰۶/۰۱', user: { name: 'شهریار', avatar: 'https://placehold.co/40x40.png' } },
  { id: '2', title: 'جنایت و مکافات', to_city: 'مشهد', deadline: '۱۴۰۳/۰۶/۱۰', user: { name: 'شهریار', avatar: 'https://placehold.co/40x40.png' } },
];

export default function MyRequestsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">درخواست‌های من</h2>
          <p className="text-muted-foreground">درخواست‌های کتاب خود را مدیریت کنید.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="me-2 h-4 w-4" />
              درخواست جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ایجاد درخواست کتاب جدید</DialogTitle>
              <DialogDescription>
                مشخصات کتاب مورد نظر خود را وارد کنید.
              </DialogDescription>
            </DialogHeader>
            <NewRequestForm setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      
      {mockUserRequests.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {mockUserRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/10 p-12 text-center h-80">
          <h3 className="text-xl font-bold tracking-tight">هنوز درخواستی ثبت نکرده‌اید</h3>
          <p className="text-sm text-muted-foreground mt-2">برای شروع، یک درخواست کتاب جدید ایجاد کنید.</p>
          <Button className="mt-6" onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="me-2 h-4 w-4" />
            ایجاد درخواست اول
          </Button>
        </div>
      )}
    </div>
  );
}
