'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { addRequest } from "@/lib/firebase/firestore";
import { format } from "date-fns";

export function NewRequestForm({ setDialogOpen, isHeroForm = false }: { setDialogOpen: (open: boolean) => void; isHeroForm?: boolean }) {
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

    if (!data.title || !data.to_city || !date) {
        toast({
            title: "خطا",
            description: "لطفاً تمام فیلدهای ستاره‌دار را پر کنید.",
            variant: "destructive"
        })
        setIsLoading(false);
        return;
    }

    try {
        await addRequest({
            title: data.title as string,
            author: data.author as string || '',
            description: data.description as string || '',
            to_city: data.to_city as string,
            deadline: format(date, "yyyy-MM-dd"),
            quantity: Number(data.quantity) || 1,
            weight: Number(data.weight) || 0.5,
            userId: user.uid,
            user: {
                uid: user.uid,
                name: user.displayName || 'کاربر بی‌نام',
                avatar: user.photoURL
            }
        });

        toast({
            title: "درخواست ثبت شد",
            description: "درخواست کتاب شما با موفقیت ثبت شد و در پلتفرم نمایش داده می‌شود.",
        });
        if (!isHeroForm) {
            setDialogOpen(false);
        }
    } catch (error) {
         toast({
            title: "خطا در ثبت درخواست",
            description: "مشکلی در هنگام ثبت درخواست شما پیش آمد. لطفا دوباره تلاش کنید.",
            variant: "destructive"
        })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4 text-right', isHeroForm && 'space-y-3')}>
      <div className="space-y-2">
        <Label htmlFor="title">عنوان کتاب</Label>
        <Input name="title" id="title" placeholder="مثال: شازده کوچولو" dir="rtl" required/>
      </div>

      {!isHeroForm && (
        <>
          <div className="space-y-2">
            <Label htmlFor="author">نویسنده</Label>
            <Input name="author" id="author" placeholder="مثال: آنتوان دو سنت-اگزوپری" dir="rtl" />
          </div>
        </>
      )}

       <div className="space-y-2">
        <Label htmlFor="to_city">شهر مقصد</Label>
        <Input name="to_city" id="to_city" placeholder="مثال: تهران" dir="rtl" required/>
      </div>
       <div className="space-y-2">
        <Label htmlFor="deadline">تاریخ مورد نیاز</Label>
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">تعداد کتاب‌ها</Label>
          <Input name="quantity" id="quantity" type="number" defaultValue="1" dir="rtl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">وزن تقریبی (کیلوگرم)</Label>
          <Input name="weight" id="weight" type="number" step="0.1" placeholder="۰.۵" dir="rtl" />
        </div>
      </div>
      {!isHeroForm && (
        <>
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea name="description" id="description" placeholder="اطلاعات تکمیلی مانند نسخه، ترجمه و..." dir="rtl" />
          </div>
        </>
      )}
      <div className="flex justify-end pt-2">
         <Button type="submit" size={isHeroForm ? "lg" : "default"} className={cn(isHeroForm && "w-full text-base font-bold")} disabled={isLoading}>
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            ثبت درخواست
         </Button>
      </div>
    </form>
  );
}
