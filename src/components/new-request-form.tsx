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


export function NewRequestForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
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
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          عنوان کتاب
        </Label>
        <Input id="title" placeholder="مثال: شازده کوچولو" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="author" className="text-right">
          نویسنده
        </Label>
        <Input id="author" placeholder="مثال: آنتوان دو سنت-اگزوپری" className="col-span-3" />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="to_city" className="text-right">
          شهر مقصد
        </Label>
        <Input id="to_city" placeholder="مثال: تهران" className="col-span-3" />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="deadline" className="text-right">
          تاریخ مورد نیاز
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "col-span-3 justify-start text-right font-normal",
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
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right pt-2">
          توضیحات
        </Label>
        <Textarea id="description" placeholder="اطلاعات تکمیلی مانند نسخه، ترجمه و..." className="col-span-3" />
      </div>
      <div className="flex justify-end pt-2">
         <Button type="submit">ثبت درخواست</Button>
      </div>
    </form>
  );
}
