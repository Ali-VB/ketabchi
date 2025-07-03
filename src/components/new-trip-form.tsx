'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function NewTripForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "سفر شما ثبت شد",
        description: "سفر شما با موفقیت اعلام شد و برای تطبیق با درخواست‌ها استفاده می‌شود.",
    })
    setDialogOpen(false);
  }


  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="from_city" className="text-right">
          شهر مبدا
        </Label>
        <Input id="from_city" placeholder="مثال: پاریس" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="to_city" className="text-right">
          شهر مقصد
        </Label>
        <Input id="to_city" placeholder="مثال: تهران" className="col-span-3" />
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="date" className="text-right">
          تاریخ سفر
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
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="capacity" className="text-right">
          ظرفیت (کیلوگرم)
        </Label>
        <Input id="capacity" type="number" placeholder="مثال: 5" className="col-span-3" />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit">ثبت سفر</Button>
      </div>
    </form>
  );
}
