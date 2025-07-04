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

export function NewTripForm({ setDialogOpen, isHeroForm = false }: { setDialogOpen: (open: boolean) => void; isHeroForm?: boolean }) {
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

  if (isHeroForm) {
    return (
        <form onSubmit={handleSubmit} className="space-y-3 text-right">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="from_city_hero">شهر مبدا</Label>
                    <Input id="from_city_hero" placeholder="مثال: پاریس" dir="rtl" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="to_city_hero">شهر مقصد</Label>
                    <Input id="to_city_hero" placeholder="مثال: تهران" dir="rtl" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="date_hero">تاریخ سفر</Label>
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
              <Label htmlFor="capacity_hero">ظرفیت خالی (به کیلو)</Label>
              <Input id="capacity_hero" type="number" placeholder="مثال: ۵" dir="rtl" />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg" className="w-full text-base font-bold">ثبت سفر</Button>
            </div>
        </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4 text-right">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="from_city">شهر مبدا</Label>
          <Input id="from_city" placeholder="مثال: پاریس" dir="rtl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to_city">شهر مقصد</Label>
          <Input id="to_city" placeholder="مثال: تهران" dir="rtl" />
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
        <Input id="capacity" type="number" placeholder="مثال: 5" dir="rtl" />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit">ثبت سفر</Button>
      </div>
    </form>
  );
}
