'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Label } from "./ui/label";

const tripFormSchema = z.object({
  from_city: z.string().min(1, "شهر مبدا الزامی است."),
  to_city: z.string().min(1, "شهر مقصد الزامی است."),
  date: z.object(
    {
      from: z.date({ required_error: "تاریخ شروع الزامی است." }),
      to: z.date({ required_error: "تاریخ پایان الزامی است." }),
    },
    { required_error: "بازه زمانی سفر الزامی است." }
  ),
  capacity: z.coerce.number().min(0.1, "ظرفیت باید حداقل ۰.۱ کیلوگرم باشد."),
});

type TripFormValues = z.infer<typeof tripFormSchema>;

export function NewTripForm({ setDialogOpen, isHeroForm = false }: { setDialogOpen: (open: boolean) => void; isHeroForm?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      from_city: '',
      to_city: '',
      capacity: 1,
    },
  });

  const onSubmit = async (data: TripFormValues) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    setIsLoading(true);

    try {
      await addTrip({
        from_city: data.from_city,
        to_city: data.to_city,
        date_start: format(data.date.from, "yyyy-MM-dd"),
        date_end: format(data.date.to, "yyyy-MM-dd"),
        capacity: data.capacity,
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
      
      form.reset();
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

  const formatDateRange = (
    date: DateRange | undefined
  ): string => {
    if (!date?.from) {
      return "یک تاریخ انتخاب کنید";
    }
  
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
  
    const locale = 'fa-IR-u-ca-persian';
    const formatter = new Intl.DateTimeFormat(locale, formatOptions);
    const fromDate = formatter.format(date.from);
  
    if (date.to) {
      const toDate = formatter.format(date.to);
      return `${fromDate} – ${toDate}`;
    }
  
    return fromDate;
  };
  
  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4 text-right', isHeroForm ? 'space-y-3' : 'p-1')}>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="from_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شهر مبدا</FormLabel>
              <FormControl>
                <Input placeholder="مثال: پاریس" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="to_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شهر مقصد (در ایران)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: تهران" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>بازه زمانی سفر</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ms-2 h-4 w-4" />
                    {formatDateRange(field.value)}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ظرفیت خالی (کیلوگرم)</FormLabel>
            <FormControl>
              <Input type="number" step="0.5" placeholder="مثال: 5" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" size={isHeroForm ? "lg" : "default"} className={cn(isHeroForm && "w-full text-base font-bold")} disabled={isLoading}>
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            ثبت سفر
        </Button>
      </div>
    </form>
  );

  return (
    <Form {...form}>
        {formContent}
    </Form>
  );
}
