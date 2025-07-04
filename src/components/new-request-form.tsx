'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


export function NewRequestForm({ setDialogOpen, isHeroForm = false }: { setDialogOpen: (open: boolean) => void; isHeroForm?: boolean }) {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "درخواست ثبت شد",
        description: "درخواست کتاب شما با موفقیت ثبت شد و در پلتفرم نمایش داده می‌شود.",
    })
    setDialogOpen(false);
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4 text-right', isHeroForm && 'space-y-3')}>
      <div className="space-y-2">
        <Label htmlFor="title">عنوان کتاب</Label>
        <Input id="title" placeholder="مثال: شازده کوچولو" dir="rtl" />
      </div>
      {!isHeroForm && (
        <div className="space-y-2">
          <Label htmlFor="author">نویسنده</Label>
          <Input id="author" placeholder="مثال: آنتوان دو سنت-اگزوپری" dir="rtl" />
        </div>
      )}
       <div className="space-y-2">
        <Label htmlFor="to_city">شهر مقصد</Label>
        <Input id="to_city" placeholder="مثال: تهران" dir="rtl" />
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
      {!isHeroForm && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">تعداد کتاب‌ها</Label>
              <Input id="quantity" type="number" defaultValue="1" dir="rtl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">وزن تقریبی (کیلوگرم)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="۰.۵" dir="rtl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea id="description" placeholder="اطلاعات تکمیلی مانند نسخه، ترجمه و..." dir="rtl" />
          </div>
        </>
      )}
      <div className="flex justify-end pt-2">
         <Button type="submit" size={isHeroForm ? "lg" : "default"} className={cn(isHeroForm && "w-full text-base font-bold")}>ثبت درخواست</Button>
      </div>
    </form>
  );
}
