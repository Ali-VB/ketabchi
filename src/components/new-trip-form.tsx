'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { addTrip } from "@/lib/firebase/firestore";
import { format } from "date-fns";

export function NewTripForm({ setDialogOpen, isHeroForm = false }: { setDialogOpen: (open: boolean) => void; isHeroForm?: boolean }) {
  const [date, setDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (!data.from_city || !data.to_city || !date || !data.capacity) {
        toast({
            title: "خطا",
            description: "لطفاً تمام فیلدها را پر کنید.",
            variant: "destructive"
        })
        setIsLoading(false);
        return;
    }

    try {
        await addTrip({
            from_city: data.from_city as string,
            to_city: data.to_city as string,
            date: format(date, "yyyy-MM-dd"),
            capacity: Number(data.capacity),
            userId: user.uid,
            user: {
                uid: user.uid,
                name: user.displayName || 'کاربر بی‌نام',
                avatar: user.photoURL
            }
        });
        
        toast({
            title: "سفر شما ثبت شد",
            description: "سفر شما با موفقیت اعلام شد و برای تطبیق با درخواست‌ها استفاده می‌شود.",
        });

        if (!isHeroForm) {
            setDialogOpen(false);
        }
    } catch (error) {
        toast({
            title: "خطا در ثبت سفر",
            description: "مشکلی در هنگام ثبت سفر شما پیش آمد. لطفا دوباره تلاش کنید.",
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
  }
  
  const formContent = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="from_city">شهر مبدا</Label>
          <Input name="from_city" id="from_city" placeholder="مثال: پاریس" dir="rtl" required/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="to_city">شهر مقصد</Label>
          <Input name="to_city" id="to_city" placeholder="مثال: تهران" dir="rtl" required/>
        </div>
      </div>
       <div className="space-y-2">
        <Label htmlFor="date">تاریخ سفر</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-right font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="ms-2 h-4 w-4" />
              {date ? new Intl.DateTimeFormat('fa-IR').format(date) : <span>یک تاریخ انتخاب کنید</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">ظرفیت خالی (به کیلو)</Label>
        <Input name="capacity" id="capacity" type="number" placeholder="مثال: 5" dir="rtl" required/>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" size={isHeroForm ? "lg" : "default"} className={cn(isHeroForm && "w-full text-base font-bold")} disabled={isLoading}>
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            ثبت سفر
        </Button>
      </div>
    </>
  );

  if (isHeroForm) {
    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-right">
            {formContent}
        </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 text-right">
        {formContent}
    </form>
  );
}
